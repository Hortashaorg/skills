/**
 * Process a single package fetch.
 */

import {
	db,
	dbProvider,
	dbSchema,
	eq,
	type Registry,
} from "@package/database/server";
import {
	type ChannelDependencyInsert,
	deleteChannelDependencies,
	deleteReleaseChannels,
	ensurePackagesExist,
	getExistingChannels,
	getExistingDependencies,
	insertChannelDependencies,
	insertReleaseChannel,
	markFetchCompleted,
	markFetchFailed,
	markPackageFailed,
	updateReleaseChannel,
	upsertPackage,
} from "./db.ts";
import { npm } from "./registries/index.ts";
import type { ReleaseChannelData } from "./registries/types.ts";

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

interface SyncResult {
	channelsCreated: number;
	channelsUpdated: number;
	channelsDeleted: number;
	depsCreated: number;
	depsDeleted: number;
}

/** Sync release channels and dependencies atomically in a transaction */
async function syncChannelsAndDeps(
	packageId: string,
	releaseChannels: ReleaseChannelData[],
	packageNames: Map<string, string>,
	now: number,
): Promise<SyncResult> {
	return db.transaction(async (tx) => {
		let channelsCreated = 0;
		let channelsUpdated = 0;
		let depsCreated = 0;
		let depsDeleted = 0;

		// Get existing channels for diff
		const existingChannels = await getExistingChannels(packageId, tx);

		// Process each channel from new data
		const processedChannelNames = new Set<string>();

		for (const channel of releaseChannels) {
			processedChannelNames.add(channel.channel);
			const existing = existingChannels.get(channel.channel);

			let channelId: string;

			if (existing) {
				channelId = existing.id;
				if (existing.version !== channel.version) {
					await updateReleaseChannel(
						channelId,
						channel.version,
						channel.publishedAt,
						new Date(now),
						tx,
					);
					channelsUpdated++;
				}
			} else {
				channelId = crypto.randomUUID();
				await insertReleaseChannel(
					{
						id: channelId,
						packageId,
						channel: channel.channel,
						version: channel.version,
						publishedAt: channel.publishedAt,
						createdAt: new Date(now),
						updatedAt: new Date(now),
					},
					tx,
				);
				channelsCreated++;
			}

			// Build dependencies with resolved IDs
			const newDeps: ChannelDependencyInsert[] = [];
			for (const dep of channel.dependencies) {
				const depPackageId = packageNames.get(dep.name);
				if (!depPackageId) {
					throw new Error(
						`Failed to resolve package ID for dependency: ${dep.name}`,
					);
				}

				newDeps.push({
					id: crypto.randomUUID(),
					channelId,
					dependencyPackageId: depPackageId,
					dependencyVersionRange: dep.versionRange,
					dependencyType: dep.type,
					createdAt: new Date(now),
				});
			}

			// Diff dependencies for this channel
			if (existing) {
				const existingDeps = await getExistingDependencies(channelId, tx);

				// Find deps to delete: exist in DB but not in new data (or range changed)
				const depsToDelete: string[] = [];
				for (const dep of existingDeps) {
					const match = newDeps.find(
						(d) =>
							d.dependencyPackageId === dep.dependencyPackageId &&
							d.dependencyType === dep.dependencyType &&
							d.dependencyVersionRange === dep.dependencyVersionRange,
					);
					if (!match) {
						depsToDelete.push(dep.id);
					}
				}

				// Find deps to insert: in new data but not in DB (or range changed)
				const depsToInsert = newDeps.filter((d) => {
					const match = existingDeps.find(
						(dep) =>
							dep.dependencyPackageId === d.dependencyPackageId &&
							dep.dependencyType === d.dependencyType &&
							dep.dependencyVersionRange === d.dependencyVersionRange,
					);
					return !match;
				});

				if (depsToDelete.length > 0) {
					await deleteChannelDependencies(depsToDelete, tx);
					depsDeleted += depsToDelete.length;
				}

				if (depsToInsert.length > 0) {
					await insertChannelDependencies(depsToInsert, tx);
					depsCreated += depsToInsert.length;
				}
			} else {
				if (newDeps.length > 0) {
					await insertChannelDependencies(newDeps, tx);
					depsCreated += newDeps.length;
				}
			}
		}

		// Delete channels that no longer exist
		const channelsToDelete: string[] = [];
		for (const [channelName, { id }] of existingChannels) {
			if (!processedChannelNames.has(channelName)) {
				const deps = await getExistingDependencies(id, tx);
				if (deps.length > 0) {
					await deleteChannelDependencies(
						deps.map((d) => d.id),
						tx,
					);
					depsDeleted += deps.length;
				}
				channelsToDelete.push(id);
			}
		}

		if (channelsToDelete.length > 0) {
			await deleteReleaseChannels(channelsToDelete, tx);
		}

		return {
			channelsCreated,
			channelsUpdated,
			channelsDeleted: channelsToDelete.length,
			depsCreated,
			depsDeleted,
		};
	});
}

export interface ProcessResult {
	fetchId: string;
	packageId: string;
	packageName: string;
	registry: Registry;
	success: boolean;
	channelsCreated?: number;
	channelsUpdated?: number;
	channelsDeleted?: number;
	depsCreated?: number;
	depsDeleted?: number;
	placeholdersCreated?: number;
	error?: string;
}

interface FetchRecord {
	id: string;
	packageId: string;
}

/** Process a single pending fetch */
export async function processFetch(fetch: FetchRecord): Promise<ProcessResult> {
	// Get package info
	const pkg = await db
		.select({
			id: dbSchema.packages.id,
			name: dbSchema.packages.name,
			registry: dbSchema.packages.registry,
			status: dbSchema.packages.status,
			updatedAt: dbSchema.packages.updatedAt,
		})
		.from(dbSchema.packages)
		.where(eq(dbSchema.packages.id, fetch.packageId))
		.limit(1)
		.then((rows) => rows[0]);

	if (!pkg) {
		// This should never happen - fetches are always linked to packages
		throw new Error(`Package not found for fetch ${fetch.id}`);
	}

	const result: ProcessResult = {
		fetchId: fetch.id,
		packageId: pkg.id,
		packageName: pkg.name,
		registry: pkg.registry,
		success: false,
	};

	try {
		// Check cooldown - fail if package was recently updated
		if (
			pkg.status === "active" &&
			Date.now() - pkg.updatedAt.getTime() < COOLDOWN_MS
		) {
			await dbProvider.transaction(async (tx) => {
				await markFetchFailed(tx, fetch.id, "recently_updated");
			});
			result.error = "recently_updated";
			return result;
		}

		// Fetch from registry
		const fetchResult = await npm.getPackages([pkg.name]);
		const packageData = fetchResult.get(pkg.name);

		if (!packageData) {
			throw new Error(`No result for package "${pkg.name}"`);
		}

		if (packageData instanceof Error) {
			throw packageData;
		}

		// Upsert package
		const packageId = await dbProvider.transaction(async (tx) => {
			return upsertPackage(tx, packageData, pkg.registry);
		});
		result.packageId = packageId;

		// Collect all dependency names across all channels
		const allDepNames = new Set<string>();
		for (const channel of packageData.releaseChannels) {
			for (const dep of channel.dependencies) {
				allDepNames.add(dep.name);
			}
		}

		// Ensure all dependency packages exist (creates placeholders for missing)
		const { ids: packageNames, created: createdPlaceholders } =
			await ensurePackagesExist([...allDepNames], pkg.registry);

		// Add main package to the map
		packageNames.set(packageData.name, packageId);

		const now = Date.now();

		// Sync channels and dependencies atomically
		const syncResult = await syncChannelsAndDeps(
			packageId,
			packageData.releaseChannels,
			packageNames,
			now,
		);

		// Update result stats
		result.channelsCreated = syncResult.channelsCreated;
		result.channelsUpdated = syncResult.channelsUpdated;
		result.channelsDeleted = syncResult.channelsDeleted;
		result.depsCreated = syncResult.depsCreated;
		result.depsDeleted = syncResult.depsDeleted;
		result.placeholdersCreated = createdPlaceholders.size;

		// Mark completed (in same transaction as sync would be ideal, but
		// markFetchCompleted uses Zero mutations which need separate tx)
		await dbProvider.transaction(async (tx) => {
			await markFetchCompleted(tx, fetch.id);
		});
		result.success = true;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		result.error = errorMessage;

		// Mark both package and fetch as failed atomically
		await dbProvider.transaction(async (tx) => {
			await markPackageFailed(tx, pkg.name, pkg.registry, errorMessage);
			await markFetchFailed(tx, fetch.id, errorMessage);
		});
	}

	return result;
}

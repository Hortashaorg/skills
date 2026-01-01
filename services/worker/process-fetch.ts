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
	getExistingChannels,
	getExistingDependencies,
	getOrCreatePlaceholder,
	insertChannelDependencies,
	insertReleaseChannel,
	loadPackageNames,
	markFetchCompleted,
	markFetchFailed,
	markPackageFailed,
	updateReleaseChannel,
	upsertPackage,
} from "./db.ts";
import { npm } from "./registries/index.ts";

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

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

		// Load existing package names for dependency resolution
		const packageNames = await loadPackageNames(pkg.registry);

		// Upsert package
		const packageId = await dbProvider.transaction(async (tx) => {
			return upsertPackage(tx, packageData, pkg.registry);
		});
		result.packageId = packageId;
		packageNames.set(packageData.name, packageId);

		// Get existing channels for diff
		const existingChannels = await getExistingChannels(packageId);

		// Track stats
		let channelsCreated = 0;
		let channelsUpdated = 0;
		let depsCreated = 0;
		let depsDeleted = 0;
		const createdPlaceholders = new Set<string>();
		const now = Date.now();

		// Process each channel from new data
		const processedChannelNames = new Set<string>();

		for (const channel of packageData.releaseChannels) {
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
					);
					channelsUpdated++;
				}
			} else {
				channelId = crypto.randomUUID();
				await insertReleaseChannel({
					id: channelId,
					packageId,
					channel: channel.channel,
					version: channel.version,
					publishedAt: channel.publishedAt,
					createdAt: new Date(now),
					updatedAt: new Date(now),
				});
				channelsCreated++;
			}

			// Create placeholders for missing dependencies
			// (scheduler will create fetches for them on next run)
			for (const dep of channel.dependencies) {
				if (!packageNames.has(dep.name)) {
					const id = await dbProvider.transaction(async (tx) => {
						return getOrCreatePlaceholder(tx, dep.name, pkg.registry);
					});
					packageNames.set(dep.name, id);
					createdPlaceholders.add(dep.name);
				}
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
				const existingDeps = await getExistingDependencies(channelId);
				const newDepKeys = new Set(
					newDeps.map((d) => `${d.dependencyPackageId}:${d.dependencyType}`),
				);

				const depsToDelete: string[] = [];
				for (const [key, id] of existingDeps) {
					if (!newDepKeys.has(key)) {
						depsToDelete.push(id);
					}
				}

				const depsToInsert = newDeps.filter(
					(d) =>
						!existingDeps.has(`${d.dependencyPackageId}:${d.dependencyType}`),
				);

				if (depsToDelete.length > 0) {
					await deleteChannelDependencies(depsToDelete);
					depsDeleted += depsToDelete.length;
				}

				if (depsToInsert.length > 0) {
					await insertChannelDependencies(depsToInsert);
					depsCreated += depsToInsert.length;
				}
			} else {
				if (newDeps.length > 0) {
					await insertChannelDependencies(newDeps);
					depsCreated += newDeps.length;
				}
			}
		}

		// Delete channels that no longer exist
		const channelsToDelete: string[] = [];
		for (const [channelName, { id }] of existingChannels) {
			if (!processedChannelNames.has(channelName)) {
				const deps = await getExistingDependencies(id);
				if (deps.size > 0) {
					await deleteChannelDependencies([...deps.values()]);
					depsDeleted += deps.size;
				}
				channelsToDelete.push(id);
			}
		}

		if (channelsToDelete.length > 0) {
			await deleteReleaseChannels(channelsToDelete);
		}

		// Update result stats
		result.channelsCreated = channelsCreated;
		result.channelsUpdated = channelsUpdated;
		result.channelsDeleted = channelsToDelete.length;
		result.depsCreated = depsCreated;
		result.depsDeleted = depsDeleted;
		result.placeholdersCreated = createdPlaceholders.size;

		// Mark completed
		await dbProvider.transaction(async (tx) => {
			await markFetchCompleted(tx, fetch.id);
		});
		result.success = true;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		result.error = errorMessage;

		// Mark package as failed
		await dbProvider.transaction(async (tx) => {
			await markPackageFailed(tx, pkg.name, pkg.registry, errorMessage);
		});

		// Mark fetch as failed
		await dbProvider.transaction(async (tx) => {
			await markFetchFailed(tx, fetch.id, errorMessage);
		});
	}

	return result;
}

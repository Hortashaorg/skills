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
	bulkInsertPendingFetches,
	type ChannelDependencyInsert,
	deleteChannelDependencies,
	deleteReleaseChannels,
	getExistingChannels,
	getExistingDependencies,
	getOrCreatePlaceholder,
	insertChannelDependencies,
	insertReleaseChannel,
	loadPackageNames,
	loadPendingFetchPackageIds,
	loadPlaceholderPackages,
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
	skippedCooldown?: boolean;
	channelsCreated?: number;
	channelsUpdated?: number;
	channelsDeleted?: number;
	depsCreated?: number;
	depsDeleted?: number;
	placeholdersCreated?: number;
	newFetchesScheduled?: number;
	error?: string;
}

interface FetchRecord {
	id: string;
	packageId: string;
	status: string;
	createdAt: number;
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
		return {
			fetchId: fetch.id,
			packageId: fetch.packageId,
			packageName: "unknown",
			registry: "npm",
			success: false,
			error: "Package not found",
		};
	}

	const result: ProcessResult = {
		fetchId: fetch.id,
		packageId: pkg.id,
		packageName: pkg.name,
		registry: pkg.registry,
		success: false,
	};

	try {
		// 1. Check cooldown - skip if package was recently updated
		if (
			pkg.status === "active" &&
			Date.now() - pkg.updatedAt.getTime() < COOLDOWN_MS
		) {
			await dbProvider.transaction(async (tx) => {
				await markFetchCompleted(tx, fetch.id);
			});
			result.success = true;
			result.skippedCooldown = true;
			return result;
		}

		// 2. Fetch from registry
		const fetchResult = await npm.getPackages([pkg.name]);
		const packageData = fetchResult.get(pkg.name);

		if (!packageData) {
			throw new Error(`No result for package "${pkg.name}"`);
		}

		if (packageData instanceof Error) {
			throw packageData;
		}

		// 4. Pre-load caches
		const [packageNames, pendingFetchPackageIds, placeholderPackages] =
			await Promise.all([
				loadPackageNames(pkg.registry),
				loadPendingFetchPackageIds(),
				loadPlaceholderPackages(pkg.registry),
			]);

		// 5. Upsert package
		const packageId = await dbProvider.transaction(async (tx) => {
			return upsertPackage(tx, packageData, pkg.registry);
		});
		result.packageId = packageId;
		packageNames.set(packageData.name, packageId);

		// 6. Get existing channels for diff
		const existingChannels = await getExistingChannels(packageId);

		// Track stats
		let channelsCreated = 0;
		let channelsUpdated = 0;
		let depsCreated = 0;
		let depsDeleted = 0;
		const createdPlaceholders = new Set<string>();
		const newFetches: Array<{
			id: string;
			packageId: string;
			createdAt: number;
		}> = [];
		const now = Date.now();

		// 7. Process each channel from new data
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

			// 8. Collect missing dependency names first
			const missingDepNames: string[] = [];
			for (const dep of channel.dependencies) {
				if (!packageNames.has(dep.name)) {
					missingDepNames.push(dep.name);
				}

				// Schedule fetch for missing packages OR existing placeholders
				const depPackageId = packageNames.get(dep.name);
				const isPlaceholder = depPackageId && placeholderPackages.has(dep.name);
				const needsFetch = !depPackageId || isPlaceholder;

				if (needsFetch) {
					const targetPackageId = depPackageId || "pending";
					if (
						targetPackageId !== "pending" &&
						!pendingFetchPackageIds.has(targetPackageId) &&
						!newFetches.some((f) => f.packageId === targetPackageId)
					) {
						newFetches.push({
							id: crypto.randomUUID(),
							packageId: targetPackageId,
							createdAt: now,
						});
					}
				}
			}

			// 9. Create placeholders for missing dependencies
			for (const name of missingDepNames) {
				if (!packageNames.has(name)) {
					const id = await dbProvider.transaction(async (tx) => {
						return getOrCreatePlaceholder(tx, name, pkg.registry);
					});
					packageNames.set(name, id);
					createdPlaceholders.add(name);

					// Schedule fetch for newly created placeholder
					if (!pendingFetchPackageIds.has(id)) {
						newFetches.push({
							id: crypto.randomUUID(),
							packageId: id,
							createdAt: now,
						});
					}
				}
			}

			// 10. Now build dependencies with resolved IDs
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

			// 11. Diff dependencies for this channel
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

		// 12. Delete channels that no longer exist
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

		// 13. Schedule new fetches
		await bulkInsertPendingFetches(newFetches);

		// 14. Update result stats
		result.channelsCreated = channelsCreated;
		result.channelsUpdated = channelsUpdated;
		result.channelsDeleted = channelsToDelete.length;
		result.depsCreated = depsCreated;
		result.depsDeleted = depsDeleted;
		result.placeholdersCreated = createdPlaceholders.size;
		result.newFetchesScheduled = newFetches.length;

		// 15. Mark completed
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

import { dbProvider, type Registry, type Row } from "@package/database/server";
import {
	bulkInsertPendingRequests,
	type ChannelDependencyInsert,
	deleteChannelDependencies,
	deleteReleaseChannels,
	getExistingChannels,
	getExistingDependencies,
	insertChannelDependencies,
	insertReleaseChannel,
	loadActiveRequests,
	loadPackageNames,
	type RequestInsert,
	updateReleaseChannel,
} from "./db/bulk.ts";
import {
	findPackage,
	getOrCreatePlaceholder,
	incrementAttempt,
	markPackageFailed,
	updateRequestStatus,
	upsertPackage,
} from "./db/index.ts";
import { npm } from "./registries/index.ts";

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

export interface ProcessResult {
	requestId: string;
	packageName: string;
	registry: Registry;
	success: boolean;
	skippedCooldown?: boolean;
	packageId?: string;
	channelsCreated?: number;
	channelsUpdated?: number;
	channelsDeleted?: number;
	depsCreated?: number;
	depsDeleted?: number;
	placeholdersCreated?: number;
	newRequestsScheduled?: number;
	error?: string;
}

/** Process a single package request */
export async function processRequest(
	request: Row["packageRequests"],
): Promise<ProcessResult> {
	const result: ProcessResult = {
		requestId: request.id,
		packageName: request.packageName,
		registry: request.registry,
		success: false,
	};

	try {
		// 1. Check cooldown - skip if package was recently updated
		const existingPkg = await dbProvider.transaction(async (tx) => {
			return findPackage(tx, request.packageName, request.registry);
		});

		if (
			existingPkg &&
			existingPkg.status === "active" &&
			Date.now() - existingPkg.updatedAt < COOLDOWN_MS
		) {
			await dbProvider.transaction(async (tx) => {
				await updateRequestStatus(tx, request.id, "completed", existingPkg.id);
			});
			result.success = true;
			result.skippedCooldown = true;
			result.packageId = existingPkg.id;
			return result;
		}

		// 2. Mark as fetching and increment attempt
		await dbProvider.transaction(async (tx) => {
			await updateRequestStatus(tx, request.id, "fetching");
			await incrementAttempt(tx, request.id, request.attemptCount);
		});

		// 3. Fetch from registry
		const fetchResult = await npm.getPackages([request.packageName]);
		const packageData = fetchResult.get(request.packageName);

		if (!packageData) {
			throw new Error(`No result for package "${request.packageName}"`);
		}

		if (packageData instanceof Error) {
			throw packageData;
		}

		// 4. Pre-load caches
		const [packageNames, activeRequests] = await Promise.all([
			loadPackageNames(request.registry),
			loadActiveRequests(request.registry),
		]);

		// 5. Upsert package
		const packageId = await dbProvider.transaction(async (tx) => {
			return upsertPackage(tx, packageData, request.registry);
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
		const placeholderNames = new Set<string>();
		const pendingRequestInserts: RequestInsert[] = [];
		const newRequestNames = new Set<string>();
		const now = new Date();

		// 7. Process each channel from new data
		const processedChannelNames = new Set<string>();

		for (const channel of packageData.releaseChannels) {
			processedChannelNames.add(channel.channel);
			const existing = existingChannels.get(channel.channel);

			let channelId: string;

			if (existing) {
				// Channel exists - update if version changed
				channelId = existing.id;
				if (existing.version !== channel.version) {
					await updateReleaseChannel(
						channelId,
						channel.version,
						channel.publishedAt,
						now,
					);
					channelsUpdated++;
				}
			} else {
				// New channel - insert
				channelId = crypto.randomUUID();
				await insertReleaseChannel({
					id: channelId,
					packageId,
					channel: channel.channel,
					version: channel.version,
					publishedAt: channel.publishedAt,
					createdAt: now,
					updatedAt: now,
				});
				channelsCreated++;
			}

			// 8. Resolve dependency package IDs (create placeholders if needed)
			const newDeps: ChannelDependencyInsert[] = [];
			for (const dep of channel.dependencies) {
				const depPackageId = packageNames.get(dep.name);

				if (!depPackageId) {
					placeholderNames.add(dep.name);
				}

				newDeps.push({
					id: crypto.randomUUID(),
					channelId,
					dependencyPackageId: depPackageId ?? dep.name, // Temp: name until resolved
					dependencyVersionRange: dep.versionRange,
					dependencyType: dep.type,
					createdAt: now,
				});

				// Schedule request for missing packages
				if (
					!depPackageId &&
					!activeRequests.has(dep.name) &&
					!newRequestNames.has(dep.name)
				) {
					newRequestNames.add(dep.name);
					pendingRequestInserts.push({
						id: crypto.randomUUID(),
						packageName: dep.name,
						registry: request.registry,
						status: "pending",
						errorMessage: null,
						packageId: null,
						attemptCount: 0,
						createdAt: now,
						updatedAt: now,
					});
				}
			}

			// 9. Create placeholders now
			for (const name of placeholderNames) {
				if (!packageNames.has(name)) {
					const id = await dbProvider.transaction(async (tx) => {
						return getOrCreatePlaceholder(tx, name, request.registry);
					});
					packageNames.set(name, id);
				}
			}

			// Resolve placeholder IDs in new deps
			for (const dep of newDeps) {
				if (!dep.dependencyPackageId.includes("-")) {
					const resolvedId = packageNames.get(dep.dependencyPackageId);
					if (resolvedId) {
						dep.dependencyPackageId = resolvedId;
					}
				}
			}

			// 10. Diff dependencies for this channel
			if (existing) {
				const existingDeps = await getExistingDependencies(channelId);
				const newDepKeys = new Set(
					newDeps.map((d) => `${d.dependencyPackageId}:${d.dependencyType}`),
				);

				// Find deps to delete (in existing but not in new)
				const depsToDelete: string[] = [];
				for (const [key, id] of existingDeps) {
					if (!newDepKeys.has(key)) {
						depsToDelete.push(id);
					}
				}

				// Find deps to insert (in new but not in existing)
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
				// New channel - insert all deps
				if (newDeps.length > 0) {
					await insertChannelDependencies(newDeps);
					depsCreated += newDeps.length;
				}
			}
		}

		// 11. Delete channels that no longer exist
		const channelsToDelete: string[] = [];
		for (const [channelName, { id }] of existingChannels) {
			if (!processedChannelNames.has(channelName)) {
				// First delete dependencies for this channel
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

		// 12. Schedule new requests
		await bulkInsertPendingRequests(pendingRequestInserts);

		// 13. Update result stats
		result.channelsCreated = channelsCreated;
		result.channelsUpdated = channelsUpdated;
		result.channelsDeleted = channelsToDelete.length;
		result.depsCreated = depsCreated;
		result.depsDeleted = depsDeleted;
		result.placeholdersCreated = placeholderNames.size;
		result.newRequestsScheduled = pendingRequestInserts.length;

		// 14. Mark completed
		await dbProvider.transaction(async (tx) => {
			await updateRequestStatus(tx, request.id, "completed", packageId);
		});
		result.success = true;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		result.error = errorMessage;

		// Mark package as failed
		await dbProvider.transaction(async (tx) => {
			await markPackageFailed(
				tx,
				request.packageName,
				request.registry,
				errorMessage,
			);
		});

		const newAttemptCount = request.attemptCount + 1;
		const status = newAttemptCount >= 3 ? "discarded" : "failed";

		await dbProvider.transaction(async (tx) => {
			await updateRequestStatus(tx, request.id, status, null, errorMessage);
		});
	}

	return result;
}

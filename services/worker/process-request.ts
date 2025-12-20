import { dbProvider, type Registry, type Row } from "@package/database/server";
import {
	bulkInsertDependencies,
	bulkInsertPendingRequests,
	bulkInsertVersions,
	bulkLinkDependencies,
	type DependencyInsert,
	loadActiveRequests,
	loadPackageNames,
	type RequestInsert,
	type VersionInsert,
} from "./db/bulk.ts";
import {
	getExistingVersions,
	incrementAttempt,
	updateRequestStatus,
	upsertPackage,
} from "./db/index.ts";
import { npm } from "./registries/index.ts";

export interface ProcessResult {
	requestId: string;
	packageName: string;
	registry: Registry;
	success: boolean;
	packageId?: string;
	versionsTotal?: number;
	versionsNew?: number;
	versionsSkipped?: number;
	dependenciesCreated?: number;
	dependenciesLinked?: number;
	dependenciesExisting?: number;
	dependenciesQueued?: number;
	newRequestsScheduled?: number;
	error?: string;
}

/** Process a single package request with bulk operations */
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
		// 1. Mark as fetching and increment attempt (still uses Zero for consistency)
		await dbProvider.transaction(async (tx) => {
			await updateRequestStatus(tx, request.id, "fetching");
			await incrementAttempt(tx, request.id, request.attemptCount);
		});

		// 2. Fetch from registry (outside transaction - network call)
		const fetchResult = await npm.getPackages([request.packageName]);
		const packageData = fetchResult.get(request.packageName);

		if (!packageData) {
			throw new Error(`No result for package "${request.packageName}"`);
		}

		if (packageData instanceof Error) {
			throw packageData;
		}

		// 3. Pre-load existing data for fast lookups
		const [packageNames, activeRequests] = await Promise.all([
			loadPackageNames(request.registry),
			loadActiveRequests(request.registry),
		]);

		// 4. Upsert package (still uses Zero transaction)
		const packageId = await dbProvider.transaction(async (tx) => {
			return upsertPackage(tx, packageData, request.registry);
		});
		result.packageId = packageId;

		// Update cache with new package
		packageNames.set(packageData.name, packageId);

		// 5. Get existing versions and filter to only new ones
		const existingVersions = await dbProvider.transaction(async (tx) => {
			return getExistingVersions(tx, packageId);
		});

		const newVersions = packageData.versions.filter(
			(v) => !existingVersions.has(v.version),
		);

		result.versionsTotal = packageData.versions.length;
		result.versionsNew = newVersions.length;
		result.versionsSkipped = existingVersions.size;

		// 6. Prepare bulk inserts
		const now = new Date();
		const versionInserts: VersionInsert[] = [];
		const dependencyInserts: DependencyInsert[] = [];
		const pendingRequestInserts: RequestInsert[] = [];
		const newRequestNames = new Set<string>();
		let depsExisting = 0;
		let depsAlreadyQueued = 0;

		for (const version of newVersions) {
			const versionId = crypto.randomUUID();

			versionInserts.push({
				id: versionId,
				packageId,
				version: version.version,
				publishedAt: version.publishedAt,
				isPrerelease: version.isPrerelease,
				isYanked: version.isYanked,
				createdAt: now,
			});

			// Process dependencies for this version
			for (const dep of version.dependencies) {
				const existingPackageId = packageNames.get(dep.name) ?? null;

				dependencyInserts.push({
					id: crypto.randomUUID(),
					packageId,
					versionId,
					dependencyName: dep.name,
					dependencyPackageId: existingPackageId,
					dependencyVersionRange: dep.versionRange,
					resolvedVersion: dep.versionRange,
					resolvedVersionId: null,
					dependencyType: dep.type,
					createdAt: now,
					updatedAt: now,
				});

				if (existingPackageId) {
					depsExisting++;
				} else if (activeRequests.has(dep.name) || newRequestNames.has(dep.name)) {
					depsAlreadyQueued++;
				} else {
					// Schedule missing dependency for fetching
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
		}

		// 7. Execute bulk inserts
		await bulkInsertVersions(versionInserts);
		await bulkInsertDependencies(dependencyInserts);
		await bulkInsertPendingRequests(pendingRequestInserts);

		result.dependenciesCreated = dependencyInserts.length;
		result.dependenciesExisting = depsExisting;
		result.dependenciesQueued = depsAlreadyQueued;
		result.newRequestsScheduled = pendingRequestInserts.length;

		// 8. Link any previously unlinked deps that reference this package
		const linkedCount = await bulkLinkDependencies(
			packageId,
			request.packageName,
		);
		result.dependenciesLinked = linkedCount;

		// 9. Mark completed
		await dbProvider.transaction(async (tx) => {
			await updateRequestStatus(tx, request.id, "completed", packageId);
		});
		result.success = true;
	} catch (error) {
		// Handle failure
		const errorMessage = error instanceof Error ? error.message : String(error);
		result.error = errorMessage;

		const newAttemptCount = request.attemptCount + 1;
		const status = newAttemptCount >= 3 ? "discarded" : "failed";

		await dbProvider.transaction(async (tx) => {
			await updateRequestStatus(tx, request.id, status, null, errorMessage);
			await incrementAttempt(tx, request.id, request.attemptCount);
		});
	}

	return result;
}

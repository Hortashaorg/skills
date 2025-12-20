import {
	dbProvider,
	type Registry,
	type Row,
} from "@package/database/server";
import {
	createDependency,
	createPendingRequest,
	createVersion,
	findActiveRequest,
	findPackage,
	incrementAttempt,
	linkDependencies,
	updateRequestStatus,
	upsertPackage,
} from "./db/index.ts";
import { npm } from "./registries/index.ts";
import type { DependencyData } from "./registries/types.ts";

type Transaction = Parameters<Parameters<typeof dbProvider.transaction>[0]>[0];

export interface ProcessResult {
	requestId: string;
	packageName: string;
	registry: Registry;
	success: boolean;
	packageId?: string;
	versionsProcessed?: number;
	dependenciesCreated?: number;
	dependenciesLinked?: number;
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
		await dbProvider.transaction(async (tx) => {
			// 1. Mark as fetching and increment attempt
			await updateRequestStatus(tx, request.id, "fetching");
			await incrementAttempt(tx, request.id, request.attemptCount);

			// 2. Fetch from registry
			const fetchResult = await npm.getPackages([request.packageName]);
			const packageData = fetchResult.get(request.packageName);

			if (!packageData) {
				throw new Error(`No result for package "${request.packageName}"`);
			}

			if (packageData instanceof Error) {
				throw packageData;
			}

			// 3. Upsert package
			const packageId = await upsertPackage(tx, packageData, request.registry);
			result.packageId = packageId;

			// 4. Process all versions
			let versionsProcessed = 0;
			let dependenciesCreated = 0;
			let newRequestsScheduled = 0;

			for (const version of packageData.versions) {
				const versionId = await createVersion(tx, packageId, version);
				versionsProcessed++;

				// 5. Process dependencies for this version
				for (const dep of version.dependencies) {
					const scheduled = await processDependency(
						tx,
						packageId,
						versionId,
						dep,
						request.registry,
					);
					dependenciesCreated++;
					if (scheduled) {
						newRequestsScheduled++;
					}
				}
			}

			result.versionsProcessed = versionsProcessed;
			result.dependenciesCreated = dependenciesCreated;
			result.newRequestsScheduled = newRequestsScheduled;

			// 6. Link any previously unlinked deps that reference this package
			const linkedCount = await linkDependencies(
				tx,
				packageId,
				request.packageName,
			);
			result.dependenciesLinked = linkedCount;

			// 7. Mark completed
			await updateRequestStatus(tx, request.id, "completed", packageId);
			result.success = true;
		});
	} catch (error) {
		// Handle failure outside transaction (since it rolled back)
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

/** Process a single dependency - returns true if a new request was scheduled */
async function processDependency(
	tx: Transaction,
	packageId: string,
	versionId: string,
	dep: DependencyData,
	registry: Registry,
): Promise<boolean> {
	// Check if dependency package exists
	const existingPackage = await findPackage(tx, dep.name, registry);

	// Create dependency record
	await createDependency(tx, {
		packageId,
		versionId,
		dependencyName: dep.name,
		dependencyPackageId: existingPackage?.id ?? null,
		dependencyVersionRange: dep.versionRange,
		dependencyType: dep.type,
	});

	// Schedule missing dependency for fetching
	if (!existingPackage) {
		const activeRequest = await findActiveRequest(tx, dep.name, registry);
		if (!activeRequest) {
			await createPendingRequest(tx, dep.name, registry);
			return true;
		}
	}

	return false;
}

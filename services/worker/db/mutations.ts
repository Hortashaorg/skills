import type {
	dbProvider,
	PackageRequestStatus,
	Registry,
} from "@package/database/server";
import type { PackageData } from "../registries/types.ts";
import { findPackage } from "./queries.ts";

type Transaction = Parameters<Parameters<typeof dbProvider.transaction>[0]>[0];

/** Upsert a package record, returns the package ID */
export async function upsertPackage(
	tx: Transaction,
	data: PackageData,
	registry: Registry,
): Promise<string> {
	const existing = await findPackage(tx, data.name, registry);
	const now = Date.now();

	if (existing) {
		// Update existing package
		await tx.mutate.packages.update({
			id: existing.id,
			description: data.description ?? null,
			homepage: data.homepage ?? null,
			repository: data.repository ?? null,
			latestVersion: data.latestVersion ?? null,
			distTags: data.distTags ?? null,
			lastFetchAttempt: now,
			lastFetchSuccess: now,
			updatedAt: now,
		});
		return existing.id;
	}

	// Create new package
	const id = crypto.randomUUID();
	await tx.mutate.packages.insert({
		id,
		name: data.name,
		registry,
		description: data.description ?? null,
		homepage: data.homepage ?? null,
		repository: data.repository ?? null,
		latestVersion: data.latestVersion ?? null,
		distTags: data.distTags ?? null,
		upvoteCount: 0,
		lastFetchAttempt: now,
		lastFetchSuccess: now,
		createdAt: now,
		updatedAt: now,
	});
	return id;
}

/** Update request status */
export async function updateRequestStatus(
	tx: Transaction,
	requestId: string,
	status: PackageRequestStatus,
	packageId?: string | null,
	errorMessage?: string | null,
): Promise<void> {
	const now = Date.now();

	await tx.mutate.packageRequests.update({
		id: requestId,
		status,
		packageId: packageId ?? null,
		errorMessage: errorMessage ?? null,
		updatedAt: now,
	});
}

/** Increment the attempt count for a request */
export async function incrementAttempt(
	tx: Transaction,
	requestId: string,
	currentCount: number,
): Promise<void> {
	const now = Date.now();

	await tx.mutate.packageRequests.update({
		id: requestId,
		attemptCount: currentCount + 1,
		updatedAt: now,
	});
}

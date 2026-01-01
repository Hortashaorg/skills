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
			status: "active",
			failureReason: null,
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
		status: "active",
		failureReason: null,
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

/** Create or get a placeholder package for a dependency */
export async function getOrCreatePlaceholder(
	tx: Transaction,
	name: string,
	registry: Registry,
): Promise<string> {
	const existing = await findPackage(tx, name, registry);
	if (existing) {
		return existing.id;
	}

	const id = crypto.randomUUID();
	const now = Date.now();
	await tx.mutate.packages.insert({
		id,
		name,
		registry,
		status: "placeholder",
		failureReason: null,
		description: null,
		homepage: null,
		repository: null,
		latestVersion: null,
		distTags: null,
		upvoteCount: 0,
		lastFetchAttempt: now,
		lastFetchSuccess: now,
		createdAt: now,
		updatedAt: now,
	});
	return id;
}

/** Mark a package as failed */
export async function markPackageFailed(
	tx: Transaction,
	name: string,
	registry: Registry,
	reason: string,
): Promise<string> {
	const existing = await findPackage(tx, name, registry);
	const now = Date.now();

	if (existing) {
		await tx.mutate.packages.update({
			id: existing.id,
			status: "failed",
			failureReason: reason,
			lastFetchAttempt: now,
			updatedAt: now,
		});
		return existing.id;
	}

	const id = crypto.randomUUID();
	await tx.mutate.packages.insert({
		id,
		name,
		registry,
		status: "failed",
		failureReason: reason,
		description: null,
		homepage: null,
		repository: null,
		latestVersion: null,
		distTags: null,
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

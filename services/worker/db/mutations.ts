import type {
	DependencyType,
	dbProvider,
	PackageRequestStatus,
	Registry,
} from "@package/database/server";
import type { PackageData, VersionData } from "../registries/types.ts";
import { findPackage, findVersion } from "./queries.ts";

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
		lastFetchAttempt: now,
		lastFetchSuccess: now,
		createdAt: now,
		updatedAt: now,
	});
	return id;
}

/** Create a version record if it doesn't exist, returns the version ID */
export async function createVersion(
	tx: Transaction,
	packageId: string,
	version: VersionData,
): Promise<string> {
	// Check if version already exists
	const existing = await findVersion(tx, packageId, version.version);
	if (existing) {
		return existing.id;
	}

	const id = crypto.randomUUID();
	const now = Date.now();

	await tx.mutate.packageVersions.insert({
		id,
		packageId,
		version: version.version,
		publishedAt: version.publishedAt.getTime(),
		isPrerelease: version.isPrerelease,
		isYanked: version.isYanked,
		createdAt: now,
	});

	return id;
}

export interface DependencyParams {
	packageId: string;
	versionId: string;
	dependencyName: string;
	dependencyPackageId: string | null;
	dependencyVersionRange: string;
	dependencyType: DependencyType;
}

/** Create a dependency record */
export async function createDependency(
	tx: Transaction,
	params: DependencyParams,
): Promise<void> {
	const id = crypto.randomUUID();
	const now = Date.now();

	await tx.mutate.packageDependencies.insert({
		id,
		packageId: params.packageId,
		versionId: params.versionId,
		dependencyName: params.dependencyName,
		dependencyPackageId: params.dependencyPackageId,
		dependencyVersionRange: params.dependencyVersionRange,
		resolvedVersion: params.dependencyVersionRange,
		resolvedVersionId: null,
		dependencyType: params.dependencyType,
		createdAt: now,
		updatedAt: now,
	});
}

/** Create a new pending package request */
export async function createPendingRequest(
	tx: Transaction,
	packageName: string,
	registry: Registry,
): Promise<void> {
	const id = crypto.randomUUID();
	const now = Date.now();

	await tx.mutate.packageRequests.insert({
		id,
		packageName,
		registry,
		status: "pending",
		errorMessage: null,
		packageId: null,
		attemptCount: 0,
		createdAt: now,
		updatedAt: now,
	});
}

/** Link unlinked dependencies to the newly created package */
export async function linkDependencies(
	tx: Transaction,
	packageId: string,
	packageName: string,
): Promise<number> {
	// Find all unlinked dependencies that reference this package name
	const allDeps = await tx.run(
		(await import("@package/database/server")).zql.packageDependencies.where(
			"dependencyName",
			packageName,
		),
	);

	const unlinked = allDeps.filter((d) => d.dependencyPackageId === null);
	const now = Date.now();

	for (const dep of unlinked) {
		await tx.mutate.packageDependencies.update({
			id: dep.id,
			dependencyPackageId: packageId,
			updatedAt: now,
		});
	}

	return unlinked.length;
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

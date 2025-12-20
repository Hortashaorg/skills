import { type dbProvider, type Registry, zql } from "@package/database/server";

type Transaction = Parameters<Parameters<typeof dbProvider.transaction>[0]>[0];

/** Find a package by name and registry */
export async function findPackage(
	tx: Transaction,
	name: string,
	registry: Registry,
) {
	return tx.run(
		zql.packages.where("name", name).where("registry", registry).one(),
	);
}

/** Find an existing version for a package */
export async function findVersion(
	tx: Transaction,
	packageId: string,
	version: string,
) {
	return tx.run(
		zql.packageVersions
			.where("packageId", packageId)
			.where("version", version)
			.one(),
	);
}

/** Check if a pending or fetching request already exists for a package */
export async function findActiveRequest(
	tx: Transaction,
	packageName: string,
	registry: Registry,
) {
	// Query all requests for this package/registry and filter for active statuses
	const requests = await tx.run(
		zql.packageRequests
			.where("packageName", packageName)
			.where("registry", registry),
	);

	return requests.find(
		(r) => r.status === "pending" || r.status === "fetching",
	);
}

/** Get all existing version strings for a package */
export async function getExistingVersions(
	tx: Transaction,
	packageId: string,
): Promise<Set<string>> {
	const versions = await tx.run(
		zql.packageVersions.where("packageId", packageId),
	);
	return new Set(versions.map((v) => v.version));
}

/** Find unlinked dependencies that reference a package name */
export async function findUnlinkedDependencies(
	tx: Transaction,
	packageName: string,
) {
	// Get all dependencies with this name that don't have a linked package
	const allDeps = await tx.run(
		zql.packageDependencies.where("dependencyName", packageName),
	);

	return allDeps.filter((d) => d.dependencyPackageId === null);
}

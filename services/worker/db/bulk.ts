/**
 * Bulk database operations using Drizzle ORM for type-safe batch inserts.
 */

import {
	and,
	db,
	dbSchema,
	eq,
	inArray,
	isNull,
	type Registry,
} from "@package/database/server";

const BATCH_SIZE = 1000;

// Infer insert types from Drizzle schema
export type VersionInsert = typeof dbSchema.packageVersions.$inferInsert;
export type DependencyInsert = typeof dbSchema.packageDependencies.$inferInsert;
export type RequestInsert = typeof dbSchema.packageRequests.$inferInsert;

/** Load all package names for a registry into a Map<name, id> */
export async function loadPackageNames(
	registry: Registry,
): Promise<Map<string, string>> {
	const rows = await db
		.select({ id: dbSchema.packages.id, name: dbSchema.packages.name })
		.from(dbSchema.packages)
		.where(eq(dbSchema.packages.registry, registry));

	const map = new Map<string, string>();
	for (const row of rows) {
		map.set(row.name, row.id);
	}
	return map;
}

/** Load all active (pending/fetching) request package names */
export async function loadActiveRequests(
	registry: Registry,
): Promise<Set<string>> {
	const rows = await db
		.select({ packageName: dbSchema.packageRequests.packageName })
		.from(dbSchema.packageRequests)
		.where(
			and(
				eq(dbSchema.packageRequests.registry, registry),
				inArray(dbSchema.packageRequests.status, ["pending", "fetching"]),
			),
		);

	const set = new Set<string>();
	for (const row of rows) {
		set.add(row.packageName);
	}
	return set;
}

/** Bulk insert versions */
export async function bulkInsertVersions(
	versions: VersionInsert[],
): Promise<void> {
	if (versions.length === 0) return;

	for (let i = 0; i < versions.length; i += BATCH_SIZE) {
		const batch = versions.slice(i, i + BATCH_SIZE);
		await db
			.insert(dbSchema.packageVersions)
			.values(batch)
			.onConflictDoNothing();
	}
}

/** Bulk insert dependencies */
export async function bulkInsertDependencies(
	deps: DependencyInsert[],
): Promise<void> {
	if (deps.length === 0) return;

	for (let i = 0; i < deps.length; i += BATCH_SIZE) {
		const batch = deps.slice(i, i + BATCH_SIZE);
		await db
			.insert(dbSchema.packageDependencies)
			.values(batch)
			.onConflictDoNothing();
	}
}

/** Bulk insert pending requests */
export async function bulkInsertPendingRequests(
	requests: RequestInsert[],
): Promise<void> {
	if (requests.length === 0) return;

	for (let i = 0; i < requests.length; i += BATCH_SIZE) {
		const batch = requests.slice(i, i + BATCH_SIZE);
		await db
			.insert(dbSchema.packageRequests)
			.values(batch)
			.onConflictDoNothing();
	}
}

/** Bulk update dependencies to link them to a package */
export async function bulkLinkDependencies(
	packageId: string,
	packageName: string,
): Promise<number> {
	const result = await db
		.update(dbSchema.packageDependencies)
		.set({
			dependencyPackageId: packageId,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(dbSchema.packageDependencies.dependencyName, packageName),
				isNull(dbSchema.packageDependencies.dependencyPackageId),
			),
		)
		.returning({ id: dbSchema.packageDependencies.id });

	return result.length;
}

/**
 * Bulk database operations using Drizzle ORM for type-safe batch inserts.
 */

import {
	and,
	db,
	dbSchema,
	eq,
	inArray,
	type Registry,
} from "@package/database/server";

const BATCH_SIZE = 1000;

// Infer insert types from Drizzle schema
export type ReleaseChannelInsert =
	typeof dbSchema.packageReleaseChannels.$inferInsert;
export type ChannelDependencyInsert =
	typeof dbSchema.channelDependencies.$inferInsert;
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

/** Load names of packages that are placeholders (need fetching) */
export async function loadPlaceholderNames(
	registry: Registry,
): Promise<Set<string>> {
	const rows = await db
		.select({ name: dbSchema.packages.name })
		.from(dbSchema.packages)
		.where(
			and(
				eq(dbSchema.packages.registry, registry),
				eq(dbSchema.packages.status, "placeholder"),
			),
		);

	return new Set(rows.map((r) => r.name));
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

/** Get existing release channels for a package */
export async function getExistingChannels(
	packageId: string,
): Promise<Map<string, { id: string; version: string }>> {
	const rows = await db
		.select({
			id: dbSchema.packageReleaseChannels.id,
			channel: dbSchema.packageReleaseChannels.channel,
			version: dbSchema.packageReleaseChannels.version,
		})
		.from(dbSchema.packageReleaseChannels)
		.where(eq(dbSchema.packageReleaseChannels.packageId, packageId));

	const map = new Map<string, { id: string; version: string }>();
	for (const row of rows) {
		map.set(row.channel, { id: row.id, version: row.version });
	}
	return map;
}

/** Get existing dependencies for a channel, keyed by (packageId, type) */
export async function getExistingDependencies(
	channelId: string,
): Promise<Map<string, string>> {
	const rows = await db
		.select({
			id: dbSchema.channelDependencies.id,
			dependencyPackageId: dbSchema.channelDependencies.dependencyPackageId,
			dependencyType: dbSchema.channelDependencies.dependencyType,
		})
		.from(dbSchema.channelDependencies)
		.where(eq(dbSchema.channelDependencies.channelId, channelId));

	// Key: "packageId:type" -> id
	const map = new Map<string, string>();
	for (const row of rows) {
		map.set(`${row.dependencyPackageId}:${row.dependencyType}`, row.id);
	}
	return map;
}

/** Insert a new release channel */
export async function insertReleaseChannel(
	channel: ReleaseChannelInsert,
): Promise<void> {
	await db.insert(dbSchema.packageReleaseChannels).values(channel);
}

/** Update an existing release channel */
export async function updateReleaseChannel(
	id: string,
	version: string,
	publishedAt: Date,
	updatedAt: Date,
): Promise<void> {
	await db
		.update(dbSchema.packageReleaseChannels)
		.set({ version, publishedAt, updatedAt })
		.where(eq(dbSchema.packageReleaseChannels.id, id));
}

/** Delete release channels by IDs */
export async function deleteReleaseChannels(ids: string[]): Promise<void> {
	if (ids.length === 0) return;
	await db
		.delete(dbSchema.packageReleaseChannels)
		.where(inArray(dbSchema.packageReleaseChannels.id, ids));
}

/** Insert channel dependencies */
export async function insertChannelDependencies(
	deps: ChannelDependencyInsert[],
): Promise<void> {
	if (deps.length === 0) return;

	for (let i = 0; i < deps.length; i += BATCH_SIZE) {
		const batch = deps.slice(i, i + BATCH_SIZE);
		await db.insert(dbSchema.channelDependencies).values(batch);
	}
}

/** Delete channel dependencies by IDs */
export async function deleteChannelDependencies(ids: string[]): Promise<void> {
	if (ids.length === 0) return;
	await db
		.delete(dbSchema.channelDependencies)
		.where(inArray(dbSchema.channelDependencies.id, ids));
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

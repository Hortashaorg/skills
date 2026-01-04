/**
 * Database operations for the worker.
 * Consolidates queries, mutations, and bulk operations.
 */

import {
	and,
	db,
	type dbProvider,
	dbSchema,
	eq,
	inArray,
	type Registry,
	zql,
} from "@package/database/server";
import type { PackageData } from "./registries/types.ts";

export type Transaction = Parameters<
	Parameters<typeof dbProvider.transaction>[0]
>[0];

// Transaction type from db.transaction (Drizzle)
type DrizzleTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Database connection type that works with both raw db and transactions
export type DbConnection = typeof db | DrizzleTx;

const BATCH_SIZE = 1000;

// ============================================================================
// Package Queries
// ============================================================================

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

// ============================================================================
// Package Mutations
// ============================================================================

/** Upsert a package record, returns the package ID */
export async function upsertPackage(
	tx: Transaction,
	data: PackageData,
	registry: Registry,
): Promise<string> {
	const existing = await findPackage(tx, data.name, registry);
	const now = Date.now();

	if (existing) {
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

export interface EnsurePackagesResult {
	/** Map of name -> id for all requested packages */
	ids: Map<string, string>;
	/** Names of packages that were newly created as placeholders */
	created: Set<string>;
}

/** Ensure packages exist, creating placeholders for missing ones */
export async function ensurePackagesExist(
	names: string[],
	registry: Registry,
): Promise<EnsurePackagesResult> {
	if (names.length === 0) {
		return { ids: new Map(), created: new Set() };
	}

	// Query which packages already exist
	const existingRows = await db
		.select({ id: dbSchema.packages.id, name: dbSchema.packages.name })
		.from(dbSchema.packages)
		.where(
			and(
				inArray(dbSchema.packages.name, names),
				eq(dbSchema.packages.registry, registry),
			),
		);

	const ids = new Map<string, string>();
	for (const row of existingRows) {
		ids.set(row.name, row.id);
	}

	// Find missing names
	const missingNames = names.filter((name) => !ids.has(name));
	const created = new Set<string>(missingNames);

	if (missingNames.length === 0) {
		return { ids, created };
	}

	// Create placeholders for missing packages
	const now = new Date();
	for (let i = 0; i < missingNames.length; i += BATCH_SIZE) {
		const batch = missingNames.slice(i, i + BATCH_SIZE);
		await db
			.insert(dbSchema.packages)
			.values(
				batch.map((name) => ({
					id: crypto.randomUUID(),
					name,
					registry,
					status: "placeholder" as const,
					failureReason: null,
					description: null,
					homepage: null,
					repository: null,
					latestVersion: null,
					distTags: null,
					upvoteCount: 0,
					lastFetchAttempt: new Date(0),
					lastFetchSuccess: new Date(0),
					createdAt: now,
					updatedAt: now,
				})),
			)
			.onConflictDoNothing();
	}

	// Fetch IDs for newly created packages
	const newRows = await db
		.select({ id: dbSchema.packages.id, name: dbSchema.packages.name })
		.from(dbSchema.packages)
		.where(
			and(
				inArray(dbSchema.packages.name, missingNames),
				eq(dbSchema.packages.registry, registry),
			),
		);

	for (const row of newRows) {
		ids.set(row.name, row.id);
	}

	return { ids, created };
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
		lastFetchSuccess: 0,
		createdAt: now,
		updatedAt: now,
	});
	return id;
}

// ============================================================================
// Fetch Mutations
// ============================================================================

/** Mark fetch as completed */
export async function markFetchCompleted(
	tx: Transaction,
	fetchId: string,
): Promise<void> {
	await tx.mutate.packageFetches.update({
		id: fetchId,
		status: "completed",
		completedAt: Date.now(),
	});
}

/** Mark fetch as failed */
export async function markFetchFailed(
	tx: Transaction,
	fetchId: string,
	errorMessage: string,
): Promise<void> {
	await tx.mutate.packageFetches.update({
		id: fetchId,
		status: "failed",
		errorMessage,
		completedAt: Date.now(),
	});
}

/** Bulk insert pending fetches */
export async function bulkInsertPendingFetches(
	fetches: Array<{ id: string; packageId: string; createdAt: number }>,
): Promise<void> {
	if (fetches.length === 0) return;

	for (let i = 0; i < fetches.length; i += BATCH_SIZE) {
		const batch = fetches.slice(i, i + BATCH_SIZE);
		await db
			.insert(dbSchema.packageFetches)
			.values(
				batch.map((f) => ({
					id: f.id,
					packageId: f.packageId,
					status: "pending" as const,
					errorMessage: null,
					createdAt: new Date(f.createdAt),
					completedAt: null,
				})),
			)
			.onConflictDoNothing();
	}
}

// ============================================================================
// Release Channel Operations
// ============================================================================

export type ReleaseChannelInsert =
	typeof dbSchema.packageReleaseChannels.$inferInsert;
export type ChannelDependencyInsert =
	typeof dbSchema.channelDependencies.$inferInsert;

/** Get existing release channels for a package */
export async function getExistingChannels(
	packageId: string,
	conn: DbConnection = db,
): Promise<Map<string, { id: string; version: string }>> {
	const rows = await conn
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

export interface ExistingDependency {
	id: string;
	dependencyPackageId: string;
	dependencyType: string;
	dependencyVersionRange: string;
}

/** Get existing dependencies for a channel */
export async function getExistingDependencies(
	channelId: string,
	conn: DbConnection = db,
): Promise<ExistingDependency[]> {
	return conn
		.select({
			id: dbSchema.channelDependencies.id,
			dependencyPackageId: dbSchema.channelDependencies.dependencyPackageId,
			dependencyType: dbSchema.channelDependencies.dependencyType,
			dependencyVersionRange:
				dbSchema.channelDependencies.dependencyVersionRange,
		})
		.from(dbSchema.channelDependencies)
		.where(eq(dbSchema.channelDependencies.channelId, channelId));
}

/** Insert a new release channel */
export async function insertReleaseChannel(
	channel: ReleaseChannelInsert,
	conn: DbConnection = db,
): Promise<void> {
	await conn.insert(dbSchema.packageReleaseChannels).values(channel);
}

/** Update an existing release channel */
export async function updateReleaseChannel(
	id: string,
	version: string,
	publishedAt: Date,
	updatedAt: Date,
	conn: DbConnection = db,
): Promise<void> {
	await conn
		.update(dbSchema.packageReleaseChannels)
		.set({ version, publishedAt, updatedAt })
		.where(eq(dbSchema.packageReleaseChannels.id, id));
}

/** Delete release channels by IDs */
export async function deleteReleaseChannels(
	ids: string[],
	conn: DbConnection = db,
): Promise<void> {
	if (ids.length === 0) return;
	await conn
		.delete(dbSchema.packageReleaseChannels)
		.where(inArray(dbSchema.packageReleaseChannels.id, ids));
}

/** Insert channel dependencies */
export async function insertChannelDependencies(
	deps: ChannelDependencyInsert[],
	conn: DbConnection = db,
): Promise<void> {
	if (deps.length === 0) return;

	for (let i = 0; i < deps.length; i += BATCH_SIZE) {
		const batch = deps.slice(i, i + BATCH_SIZE);
		await conn.insert(dbSchema.channelDependencies).values(batch);
	}
}

/** Delete channel dependencies by IDs */
export async function deleteChannelDependencies(
	ids: string[],
	conn: DbConnection = db,
): Promise<void> {
	if (ids.length === 0) return;
	await conn
		.delete(dbSchema.channelDependencies)
		.where(inArray(dbSchema.channelDependencies.id, ids));
}

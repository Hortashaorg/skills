/**
 * Database operations for the worker.
 * Consolidates queries, mutations, and bulk operations.
 */

import {
	db,
	type dbProvider,
	dbSchema,
	eq,
	inArray,
	type Registry,
	zql,
} from "@package/database/server";
import type { PackageData } from "./registries/types.ts";

type Transaction = Parameters<Parameters<typeof dbProvider.transaction>[0]>[0];

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

/** Bulk create placeholder packages, returns map of name -> id */
export async function bulkCreatePlaceholders(
	names: string[],
	registry: Registry,
): Promise<Map<string, string>> {
	if (names.length === 0) return new Map();

	const now = new Date();

	// Insert with ON CONFLICT DO NOTHING
	for (let i = 0; i < names.length; i += BATCH_SIZE) {
		const batch = names.slice(i, i + BATCH_SIZE);
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

	// Fetch IDs for all requested names (including pre-existing)
	const rows = await db
		.select({ id: dbSchema.packages.id, name: dbSchema.packages.name })
		.from(dbSchema.packages)
		.where(inArray(dbSchema.packages.name, names));

	const map = new Map<string, string>();
	for (const row of rows) {
		map.set(row.name, row.id);
	}
	return map;
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

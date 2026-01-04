/**
 * Package processing job.
 *
 * Two-step flow:
 * 1. Schedule fetches for placeholder packages without pending fetches
 * 2. Process up to 50 pending fetches sequentially
 */

import { db, dbSchema, eq } from "@package/database/server";
import { createLogger } from "@package/instrumentation/utils";
import { type ProcessResult, processFetch } from "./process-fetch.ts";
import { scheduleFetchesForPlaceholders } from "./schedule-placeholders.ts";

const logger = createLogger("worker.packages");

export async function processPackages(): Promise<void> {
	logger.info("Package processing started");

	// Step 1: Schedule fetches for any placeholder packages without pending fetches
	const scheduled = await scheduleFetchesForPlaceholders();
	if (scheduled > 0) {
		logger.info("Scheduled fetches for placeholders", { count: scheduled });
	}

	// Step 2: Query pending fetches
	const pendingFetches = await db
		.select({
			id: dbSchema.packageFetches.id,
			packageId: dbSchema.packageFetches.packageId,
		})
		.from(dbSchema.packageFetches)
		.where(eq(dbSchema.packageFetches.status, "pending"))
		.orderBy(dbSchema.packageFetches.createdAt)
		.limit(50);

	if (pendingFetches.length === 0) {
		logger.info("No pending fetches to process");
		return;
	}

	logger.info("Processing package fetches", { count: pendingFetches.length });

	const results: ProcessResult[] = [];

	// Process fetches sequentially to avoid race conditions
	for (const fetch of pendingFetches) {
		const result = await processFetch(fetch);
		results.push(result);

		if (result.success) {
			logger.info("Package fetched", {
				package: result.packageName,
				registry: result.registry,
				channelsCreated: result.channelsCreated,
				channelsUpdated: result.channelsUpdated,
				channelsDeleted: result.channelsDeleted,
				depsCreated: result.depsCreated,
				depsDeleted: result.depsDeleted,
				placeholdersCreated: result.placeholdersCreated,
			});
		} else {
			logger.warn("Package fetch failed", {
				package: result.packageName,
				registry: result.registry,
				error: result.error,
			});
		}
	}

	// Summary
	const succeeded = results.filter((r) => r.success).length;
	const failed = results.filter((r) => !r.success).length;
	const totalChannelsCreated = results.reduce(
		(sum, r) => sum + (r.channelsCreated ?? 0),
		0,
	);
	const totalChannelsUpdated = results.reduce(
		(sum, r) => sum + (r.channelsUpdated ?? 0),
		0,
	);
	const totalChannelsDeleted = results.reduce(
		(sum, r) => sum + (r.channelsDeleted ?? 0),
		0,
	);
	const totalDepsCreated = results.reduce(
		(sum, r) => sum + (r.depsCreated ?? 0),
		0,
	);
	const totalDepsDeleted = results.reduce(
		(sum, r) => sum + (r.depsDeleted ?? 0),
		0,
	);
	const totalPlaceholders = results.reduce(
		(sum, r) => sum + (r.placeholdersCreated ?? 0),
		0,
	);

	logger.info("Package processing complete", {
		processed: results.length,
		succeeded,
		failed,
		channelsCreated: totalChannelsCreated,
		channelsUpdated: totalChannelsUpdated,
		channelsDeleted: totalChannelsDeleted,
		depsCreated: totalDepsCreated,
		depsDeleted: totalDepsDeleted,
		placeholdersCreated: totalPlaceholders,
	});
}

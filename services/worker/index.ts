/**
 * TechGarden Worker
 *
 * Processes pending package fetches by fetching package metadata
 * from registries and storing results in the database.
 *
 * Runs as a Kubernetes CronJob - processes all pending fetches then exits.
 *
 * Two-step flow:
 * 1. Schedule fetches for placeholder packages without pending fetches
 * 2. Process pending fetches
 */

import { db, dbSchema, eq } from "@package/database/server";
import { type ProcessResult, processFetch } from "./process-fetch.ts";
import { scheduleFetchesForPlaceholders } from "./schedule-placeholders.ts";

async function main() {
	console.log("Worker starting...\n");

	// Step 1: Schedule fetches for any placeholder packages without pending fetches
	const scheduled = await scheduleFetchesForPlaceholders();
	if (scheduled > 0) {
		console.log(`Scheduled ${scheduled} fetches for placeholder packages.\n`);
	}

	// Step 2: Query pending fetches
	const pendingFetches = await db
		.select({
			id: dbSchema.packageFetches.id,
			packageId: dbSchema.packageFetches.packageId,
			status: dbSchema.packageFetches.status,
			createdAt: dbSchema.packageFetches.createdAt,
		})
		.from(dbSchema.packageFetches)
		.where(eq(dbSchema.packageFetches.status, "pending"))
		.orderBy(dbSchema.packageFetches.createdAt)
		.limit(50);

	if (pendingFetches.length === 0) {
		console.log("No pending fetches to process.");
		return;
	}

	console.log(`Processing ${pendingFetches.length} package fetches...\n`);

	const results: ProcessResult[] = [];

	// Process fetches sequentially to avoid race conditions
	for (const fetch of pendingFetches) {
		const result = await processFetch({
			id: fetch.id,
			packageId: fetch.packageId,
			status: fetch.status,
			createdAt: fetch.createdAt.getTime(),
		});

		console.log(`Processing: ${result.packageName} (${result.registry})...`);
		results.push(result);

		if (result.success) {
			if (result.skippedCooldown) {
				console.log(`  ⏭ Skipped (recently updated)`);
			} else {
				console.log(`  ✓ Success`);
				console.log(
					`    Channels: +${result.channelsCreated} ~${result.channelsUpdated} -${result.channelsDeleted}`,
				);
				console.log(`    Deps: +${result.depsCreated} -${result.depsDeleted}`);
				console.log(
					`    Placeholders: ${result.placeholdersCreated} | Fetches: ${result.newFetchesScheduled}`,
				);
			}
		} else {
			console.log(`  ✗ Failed: ${result.error}`);
		}
		console.log();
	}

	// Summary
	const succeeded = results.filter(
		(r) => r.success && !r.skippedCooldown,
	).length;
	const skipped = results.filter((r) => r.skippedCooldown).length;
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
	const totalScheduled = results.reduce(
		(sum, r) => sum + (r.newFetchesScheduled ?? 0),
		0,
	);

	console.log("=== Summary ===");
	console.log(`Processed: ${results.length} fetches`);
	console.log(`  Succeeded: ${succeeded}`);
	console.log(`  Skipped (cooldown): ${skipped}`);
	console.log(`  Failed: ${failed}`);
	console.log(
		`  Channels: +${totalChannelsCreated} ~${totalChannelsUpdated} -${totalChannelsDeleted}`,
	);
	console.log(`  Deps: +${totalDepsCreated} -${totalDepsDeleted}`);
	console.log(`  Placeholders: ${totalPlaceholders}`);
	console.log(`  Fetches scheduled: ${totalScheduled}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Worker failed:", error);
		process.exit(1);
	});

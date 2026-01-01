/**
 * TechGarden Worker
 *
 * Processes pending package requests by fetching package metadata
 * from registries and storing results in the database.
 *
 * Runs as a Kubernetes CronJob - processes all pending requests then exits.
 */

import { dbProvider, zql } from "@package/database/server";
import { type ProcessResult, processRequest } from "./process-request.ts";
import { scheduleRequestsForPlaceholders } from "./schedule-placeholders.ts";

async function main() {
	console.log("Worker starting...\n");

	// Schedule requests for any placeholder packages without active requests
	const scheduled = await scheduleRequestsForPlaceholders();
	if (scheduled > 0) {
		console.log(`Scheduled ${scheduled} requests for placeholder packages.\n`);
	}

	// Query pending and failed package requests (failed = retry eligible)
	const requests = await dbProvider.transaction(async (tx) => {
		const pending = await tx.run(
			zql.packageRequests
				.where("status", "pending")
				.orderBy("createdAt", "asc")
				.limit(50),
		);
		const failed = await tx.run(
			zql.packageRequests
				.where("status", "failed")
				.orderBy("createdAt", "asc")
				.limit(50),
		);
		// Combine and sort by createdAt, take first 50
		return [...pending, ...failed]
			.sort((a, b) => a.createdAt - b.createdAt)
			.slice(0, 50);
	});

	if (requests.length === 0) {
		console.log("No pending or failed requests to process.");
		return;
	}

	console.log(`Processing ${requests.length} package requests...\n`);

	const results: ProcessResult[] = [];

	// Process requests sequentially to avoid race conditions
	for (const request of requests) {
		console.log(`Processing: ${request.packageName} (${request.registry})...`);

		const result = await processRequest(request);
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
					`    Placeholders: ${result.placeholdersCreated} | Requests: ${result.newRequestsScheduled}`,
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
		(sum, r) => sum + (r.newRequestsScheduled ?? 0),
		0,
	);

	console.log("=== Summary ===");
	console.log(`Processed: ${results.length} requests`);
	console.log(`  Succeeded: ${succeeded}`);
	console.log(`  Skipped (cooldown): ${skipped}`);
	console.log(`  Failed: ${failed}`);
	console.log(
		`  Channels: +${totalChannelsCreated} ~${totalChannelsUpdated} -${totalChannelsDeleted}`,
	);
	console.log(`  Deps: +${totalDepsCreated} -${totalDepsDeleted}`);
	console.log(`  Placeholders: ${totalPlaceholders}`);
	console.log(`  Requests scheduled: ${totalScheduled}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Worker failed:", error);
		process.exit(1);
	});

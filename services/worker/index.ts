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

async function main() {
	console.log("Worker starting...\n");

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
		// Combine and sort by createdAt, take first 10
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
			console.log(`  ✓ Success`);
			console.log(
				`    Versions: ${result.versionsNew} new, ${result.versionsSkipped} skipped (${result.versionsTotal} total)`,
			);
			console.log(`    Dependencies created: ${result.dependenciesCreated}`);
			console.log(`    Dependencies linked: ${result.dependenciesLinked}`);
			console.log(`    New requests scheduled: ${result.newRequestsScheduled}`);
		} else {
			console.log(`  ✗ Failed: ${result.error}`);
		}
		console.log();
	}

	// Summary
	const succeeded = results.filter((r) => r.success).length;
	const failed = results.length - succeeded;
	const totalVersionsNew = results.reduce(
		(sum, r) => sum + (r.versionsNew ?? 0),
		0,
	);
	const totalVersionsSkipped = results.reduce(
		(sum, r) => sum + (r.versionsSkipped ?? 0),
		0,
	);
	const totalDeps = results.reduce(
		(sum, r) => sum + (r.dependenciesCreated ?? 0),
		0,
	);
	const totalScheduled = results.reduce(
		(sum, r) => sum + (r.newRequestsScheduled ?? 0),
		0,
	);

	console.log("=== Summary ===");
	console.log(`Processed: ${results.length} requests`);
	console.log(`  Succeeded: ${succeeded}`);
	console.log(`  Failed: ${failed}`);
	console.log(
		`  Versions: ${totalVersionsNew} new, ${totalVersionsSkipped} skipped`,
	);
	console.log(`  Dependencies created: ${totalDeps}`);
	console.log(`  New requests scheduled: ${totalScheduled}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Worker failed:", error);
		process.exit(1);
	});

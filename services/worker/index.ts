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

	// Query pending package requests
	const pendingRequests = await dbProvider.transaction(async (tx) => {
		return tx.run(
			zql.packageRequests
				.where("status", "pending")
				.orderBy("createdAt", "asc")
				.limit(10),
		);
	});

	if (pendingRequests.length === 0) {
		console.log("No pending requests to process.");
		return;
	}

	console.log(
		`Processing ${pendingRequests.length} pending package requests...\n`,
	);

	const results: ProcessResult[] = [];

	// Process requests sequentially to avoid race conditions
	for (const request of pendingRequests) {
		console.log(`Processing: ${request.packageName} (${request.registry})...`);

		const result = await processRequest(request);
		results.push(result);

		if (result.success) {
			console.log(`  ✓ Success`);
			console.log(`    Versions: ${result.versionsProcessed}`);
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
	const totalVersions = results.reduce(
		(sum, r) => sum + (r.versionsProcessed ?? 0),
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
	console.log(`  Versions processed: ${totalVersions}`);
	console.log(`  Dependencies created: ${totalDeps}`);
	console.log(`  New requests scheduled: ${totalScheduled}`);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Worker failed:", error);
		process.exit(1);
	});

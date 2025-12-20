/**
 * TechGarden Worker
 *
 * Processes pending package requests by fetching package metadata
 * from registries and storing results in the database.
 *
 * Runs as a Kubernetes CronJob - processes all pending requests then exits.
 */

import { dbProvider, zql } from "@package/database/server";

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

	console.log(`Found ${pendingRequests.length} pending package requests:\n`);

	for (const request of pendingRequests) {
		console.log(`  ${request.packageName} (${request.registry})`);
		console.log(`    ID: ${request.id}`);
		console.log(`    Status: ${request.status}`);
		console.log(`    Attempts: ${request.attemptCount}`);
		console.log(`    Created: ${new Date(request.createdAt).toISOString()}`);
		console.log();
	}

	console.log("Worker finished.");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Worker failed:", error);
		process.exit(1);
	});

/**
 * TechGarden Worker
 *
 * Runs as a Kubernetes CronJob - processes jobs then exits.
 *
 * Job flow:
 * 1. Process pending package fetches
 * 2. Calculate contribution scores
 */

import { calculateScores } from "./calculate-scores.ts";
import { processPackages } from "./process-packages.ts";

async function main() {
	console.log("Worker starting...\n");

	// Step 1: Process package fetches
	await processPackages();

	// Step 2: Calculate contribution scores
	await calculateScores();

	console.log("Worker complete.");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("Worker failed:", error);
		process.exit(1);
	});

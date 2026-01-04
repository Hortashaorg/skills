/**
 * TechGarden Worker
 *
 * Runs as a Kubernetes CronJob - processes jobs then exits.
 *
 * Job flow:
 * 1. Process pending package fetches
 * 2. Calculate contribution scores
 */

import { createLogger } from "@package/instrumentation/utils";
import { calculateScores } from "./calculate-scores.ts";
import { processPackages } from "./process-packages.ts";

const logger = createLogger("worker");

async function main() {
	logger.info("Worker starting");

	// Step 1: Process package fetches
	await processPackages();

	// Step 2: Calculate contribution scores
	await calculateScores();

	logger.info("Worker complete");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		logger.error("Worker failed", { error: String(error) });
		process.exit(1);
	});

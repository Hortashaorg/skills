/**
 * TechGarden Worker
 *
 * Runs as a Kubernetes CronJob - processes jobs then exits.
 *
 * Job flow:
 * 1. Process pending package fetches
 * 2. Calculate contribution scores
 */

import {
	createLogger,
	getTracer,
	SpanStatusCode,
} from "@package/instrumentation/utils";
import { calculateScores } from "./calculate-scores.ts";
import { processPackages } from "./process-packages.ts";

const logger = createLogger("worker");
const tracer = getTracer("worker");

async function main() {
	await tracer.startActiveSpan("worker.run", async (span) => {
		try {
			logger.info("Worker starting");

			// Step 1: Process package fetches
			await processPackages();

			// Step 2: Calculate contribution scores
			await calculateScores();

			logger.info("Worker complete");
			span.setStatus({ code: SpanStatusCode.OK });
		} catch (error) {
			span.setStatus({
				code: SpanStatusCode.ERROR,
				message: String(error),
			});
			span.recordException(error as Error);
			throw error;
		} finally {
			span.end();
		}
	});
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		logger.error("Worker failed", { error: String(error) });
		process.exit(1);
	});

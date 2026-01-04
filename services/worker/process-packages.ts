/**
 * Package processing job.
 *
 * Two-step flow:
 * 1. Schedule fetches for placeholder packages without pending fetches
 * 2. Process up to 50 pending fetches sequentially
 */

import { db, dbSchema, eq } from "@package/database/server";
import {
	createLogger,
	getTracer,
	SpanStatusCode,
} from "@package/instrumentation/utils";
import { type ProcessResult, processFetch } from "./process-fetch.ts";
import { scheduleFetchesForPlaceholders } from "./schedule-placeholders.ts";

const logger = createLogger("worker.packages");
const tracer = getTracer("worker");

export async function processPackages(): Promise<void> {
	await tracer.startActiveSpan("worker.packages", async (span) => {
		try {
			logger.info("Package processing started");

			// Step 1: Schedule fetches for any placeholder packages without pending fetches
			const scheduled = await scheduleFetchesForPlaceholders();
			if (scheduled > 0) {
				span.setAttribute("placeholders.scheduled", scheduled);
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

			span.setAttribute("fetches.pending", pendingFetches.length);

			if (pendingFetches.length === 0) {
				logger.info("No pending fetches to process");
				span.setStatus({ code: SpanStatusCode.OK });
				return;
			}

			logger.info("Processing package fetches", {
				count: pendingFetches.length,
			});

			const results: ProcessResult[] = [];

			// Process fetches sequentially to avoid race conditions
			for (const fetch of pendingFetches) {
				const result = await tracer.startActiveSpan(
					"worker.fetch",
					async (fetchSpan) => {
						const res = await processFetch(fetch);

						fetchSpan.setAttribute("package", res.packageName);
						fetchSpan.setAttribute("registry", res.registry);
						fetchSpan.setAttribute("success", res.success);

						if (res.success) {
							fetchSpan.setAttribute(
								"channels.created",
								res.channelsCreated ?? 0,
							);
							fetchSpan.setAttribute(
								"channels.updated",
								res.channelsUpdated ?? 0,
							);
							fetchSpan.setAttribute(
								"channels.deleted",
								res.channelsDeleted ?? 0,
							);
							fetchSpan.setAttribute("deps.created", res.depsCreated ?? 0);
							fetchSpan.setAttribute("deps.deleted", res.depsDeleted ?? 0);
							fetchSpan.setAttribute(
								"placeholders.created",
								res.placeholdersCreated ?? 0,
							);
							fetchSpan.setStatus({ code: SpanStatusCode.OK });
						} else {
							fetchSpan.setAttribute("error", res.error ?? "unknown");
							fetchSpan.setStatus({
								code: SpanStatusCode.ERROR,
								message: res.error,
							});
						}

						fetchSpan.end();
						return res;
					},
				);

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

			span.setAttribute("fetches.succeeded", succeeded);
			span.setAttribute("fetches.failed", failed);
			span.setAttribute("channels.created", totalChannelsCreated);
			span.setAttribute("channels.updated", totalChannelsUpdated);
			span.setAttribute("channels.deleted", totalChannelsDeleted);
			span.setAttribute("deps.created", totalDepsCreated);
			span.setAttribute("deps.deleted", totalDepsDeleted);
			span.setAttribute("placeholders.created", totalPlaceholders);

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

			span.setStatus({ code: SpanStatusCode.OK });
		} catch (error) {
			span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
			span.recordException(error as Error);
			throw error;
		} finally {
			span.end();
		}
	});
}

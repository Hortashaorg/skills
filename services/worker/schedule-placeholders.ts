/**
 * Schedule requests for placeholder packages that don't have active requests.
 */

import type { Registry } from "@package/database/server";
import {
	bulkInsertPendingRequests,
	loadActiveRequests,
	loadPlaceholderNames,
	type RequestInsert,
} from "./db/bulk.ts";

const registries: Registry[] = ["npm"];

export async function scheduleRequestsForPlaceholders(): Promise<number> {
	let totalScheduled = 0;

	for (const registry of registries) {
		// Load placeholder names and active requests
		const [placeholders, activeRequests] = await Promise.all([
			loadPlaceholderNames(registry),
			loadActiveRequests(registry),
		]);

		// Find placeholders without active requests
		const needsRequest: string[] = [];
		for (const name of placeholders) {
			if (!activeRequests.has(name)) {
				needsRequest.push(name);
			}
		}

		if (needsRequest.length === 0) continue;

		// Create pending requests
		const now = new Date();
		const requests: RequestInsert[] = needsRequest.map((name) => ({
			id: crypto.randomUUID(),
			packageName: name,
			registry,
			status: "pending" as const,
			errorMessage: null,
			packageId: null,
			attemptCount: 0,
			createdAt: now,
			updatedAt: now,
		}));

		await bulkInsertPendingRequests(requests);
		totalScheduled += requests.length;
	}

	return totalScheduled;
}

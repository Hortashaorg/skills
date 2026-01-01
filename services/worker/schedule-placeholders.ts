/**
 * Schedule fetches for placeholder packages that don't have pending fetches.
 */

import type { Registry } from "@package/database/server";
import {
	bulkInsertPendingFetches,
	loadPendingFetchPackageIds,
	loadPlaceholderPackages,
} from "./db.ts";

const registries: Registry[] = ["npm"];

export async function scheduleFetchesForPlaceholders(): Promise<number> {
	let totalScheduled = 0;

	for (const registry of registries) {
		// Load placeholder packages and packages with pending fetches
		const [placeholders, pendingPackageIds] = await Promise.all([
			loadPlaceholderPackages(registry),
			loadPendingFetchPackageIds(),
		]);

		// Find placeholders that don't have pending fetches
		const needsFetch: Array<{
			id: string;
			packageId: string;
			createdAt: number;
		}> = [];
		const now = Date.now();

		for (const [_name, packageId] of placeholders) {
			if (!pendingPackageIds.has(packageId)) {
				needsFetch.push({
					id: crypto.randomUUID(),
					packageId,
					createdAt: now,
				});
			}
		}

		if (needsFetch.length === 0) continue;

		await bulkInsertPendingFetches(needsFetch);
		totalScheduled += needsFetch.length;
	}

	return totalScheduled;
}

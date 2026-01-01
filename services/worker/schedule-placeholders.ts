/**
 * Schedule fetches for placeholder packages that don't have pending fetches.
 */

import { and, db, dbSchema, eq, isNull } from "@package/database/server";
import { bulkInsertPendingFetches } from "./db.ts";

export async function scheduleFetchesForPlaceholders(): Promise<number> {
	// Single query: placeholders with no pending fetch
	const rows = await db
		.select({ id: dbSchema.packages.id })
		.from(dbSchema.packages)
		.leftJoin(
			dbSchema.packageFetches,
			and(
				eq(dbSchema.packageFetches.packageId, dbSchema.packages.id),
				eq(dbSchema.packageFetches.status, "pending"),
			),
		)
		.where(
			and(
				eq(dbSchema.packages.status, "placeholder"),
				isNull(dbSchema.packageFetches.id),
			),
		);

	if (rows.length === 0) return 0;

	const now = Date.now();
	const fetches = rows.map((row) => ({
		id: crypto.randomUUID(),
		packageId: row.id,
		createdAt: now,
	}));

	await bulkInsertPendingFetches(fetches);
	return fetches.length;
}

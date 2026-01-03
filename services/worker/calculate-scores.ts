/**
 * Contribution score calculation job.
 *
 * Calculates contribution scores for users based on their contribution events.
 * Uses lastCalculatedAt to only process new events and avoid double-counting.
 *
 * For each account with unprocessed events:
 * - All-time score: Incremental (existing + new points)
 * - Monthly score: Incremental within same month, recalculated on month change
 */

import {
	and,
	db,
	dbSchema,
	eq,
	gt,
	gte,
	isNull,
	max,
	or,
	sqlExpr,
	sum,
} from "@package/database/server";

interface ScoreResult {
	accountsUpdated: number;
	eventsProcessed: number;
}

export async function calculateScores(): Promise<ScoreResult> {
	console.log("=== Score Calculation ===\n");

	const now = new Date();
	const currentMonthStart = getMonthStartUTC(now);

	// Find accounts with events that need processing:
	// - Either no score record exists (left join gives null)
	// - Or events exist after lastCalculatedAt
	const accountsToProcess = await db
		.selectDistinct({ accountId: dbSchema.contributionEvents.accountId })
		.from(dbSchema.contributionEvents)
		.leftJoin(
			dbSchema.contributionScores,
			eq(
				dbSchema.contributionEvents.accountId,
				dbSchema.contributionScores.accountId,
			),
		)
		.where(
			or(
				isNull(dbSchema.contributionScores.id),
				gt(
					dbSchema.contributionEvents.createdAt,
					dbSchema.contributionScores.lastCalculatedAt,
				),
			),
		);

	if (accountsToProcess.length === 0) {
		console.log("No accounts need score updates.\n");
		return { accountsUpdated: 0, eventsProcessed: 0 };
	}

	console.log(
		`Processing scores for ${accountsToProcess.length} accounts...\n`,
	);

	let totalEventsProcessed = 0;

	// Process each account in a transaction
	for (const { accountId } of accountsToProcess) {
		const eventsProcessed = await db.transaction(async (tx) => {
			// Get existing score record
			const [existingScore] = await tx
				.select()
				.from(dbSchema.contributionScores)
				.where(eq(dbSchema.contributionScores.accountId, accountId));

			const lastCalculatedAt = existingScore?.lastCalculatedAt ?? new Date(0);
			const monthChanged = !isSameUTCMonth(lastCalculatedAt, now);

			// Get new events since last calculation: sum, count, and max timestamp
			// Using max(createdAt) ensures we track exactly which events we processed
			const [newEventsResult] = await tx
				.select({
					total: sqlExpr<number>`COALESCE(${sum(dbSchema.contributionEvents.points)}, 0)`,
					count: sqlExpr<number>`COUNT(*)`,
					maxCreatedAt: max(dbSchema.contributionEvents.createdAt),
				})
				.from(dbSchema.contributionEvents)
				.where(
					and(
						eq(dbSchema.contributionEvents.accountId, accountId),
						gt(dbSchema.contributionEvents.createdAt, lastCalculatedAt),
					),
				);

			const newPoints = Number(newEventsResult?.total ?? 0);
			const eventCount = Number(newEventsResult?.count ?? 0);
			const newLastCalculatedAt =
				newEventsResult?.maxCreatedAt ?? lastCalculatedAt;
			const allTimeScore = (existingScore?.allTimeScore ?? 0) + newPoints;

			// Monthly score calculation:
			// - Same month: incremental (existing + new points)
			// - Month changed: recalculate from all events in current month
			let monthlyScore: number;
			if (monthChanged || !existingScore) {
				const [monthlyResult] = await tx
					.select({
						total: sqlExpr<number>`COALESCE(${sum(dbSchema.contributionEvents.points)}, 0)`,
					})
					.from(dbSchema.contributionEvents)
					.where(
						and(
							eq(dbSchema.contributionEvents.accountId, accountId),
							gte(dbSchema.contributionEvents.createdAt, currentMonthStart),
						),
					);
				monthlyScore = Number(monthlyResult?.total ?? 0);
			} else {
				monthlyScore = existingScore.monthlyScore + newPoints;
			}

			if (existingScore) {
				await tx
					.update(dbSchema.contributionScores)
					.set({
						monthlyScore,
						allTimeScore,
						lastCalculatedAt: newLastCalculatedAt,
					})
					.where(eq(dbSchema.contributionScores.id, existingScore.id));
			} else {
				await tx.insert(dbSchema.contributionScores).values({
					id: crypto.randomUUID(),
					accountId,
					monthlyScore,
					allTimeScore,
					lastCalculatedAt: newLastCalculatedAt,
				});
			}

			return eventCount;
		});

		totalEventsProcessed += eventsProcessed;
	}

	console.log(`Summary:`);
	console.log(`  Accounts updated: ${accountsToProcess.length}`);
	console.log(`  Events processed: ${totalEventsProcessed}\n`);

	return {
		accountsUpdated: accountsToProcess.length,
		eventsProcessed: totalEventsProcessed,
	};
}

function getMonthStartUTC(date: Date): Date {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function isSameUTCMonth(a: Date, b: Date): boolean {
	return (
		a.getUTCFullYear() === b.getUTCFullYear() &&
		a.getUTCMonth() === b.getUTCMonth()
	);
}

import { db, dbSchema, eq, inArray } from "@package/database/server";
import { createLogger } from "@package/instrumentation/utils";
import type { Context } from "hono";
import { getAuthContext } from "./util.ts";

const logger = createLogger("gdpr-export");

// Tables with user data (update when adding new user-related tables):
// - account, projects, projectUpvotes, projectMembers, projectPackages, packageUpvotes
// - suggestions, suggestionVotes, contributionEvents, contributionScores, notifications

export const handleGdprExport = async (c: Context) => {
	const ctx = await getAuthContext(c);

	if (ctx.userID === "anon") {
		return c.json({ error: "Not authenticated" }, 401);
	}

	try {
		const userId = ctx.userID;

		// Account
		const [account] = await db
			.select()
			.from(dbSchema.account)
			.where(eq(dbSchema.account.id, userId));

		// Projects
		const projects = await db
			.select()
			.from(dbSchema.projects)
			.where(eq(dbSchema.projects.accountId, userId));

		// Project packages (for user's projects)
		const projectIds = projects.map((p) => p.id);
		const projectPackages =
			projectIds.length > 0
				? await db
						.select()
						.from(dbSchema.projectPackages)
						.where(inArray(dbSchema.projectPackages.projectId, projectIds))
				: [];

		// Project upvotes
		const projectUpvotes = await db
			.select()
			.from(dbSchema.projectUpvotes)
			.where(eq(dbSchema.projectUpvotes.accountId, userId));

		// Project members
		const projectMembers = await db
			.select()
			.from(dbSchema.projectMembers)
			.where(eq(dbSchema.projectMembers.accountId, userId));

		// Package upvotes
		const upvotes = await db
			.select()
			.from(dbSchema.packageUpvotes)
			.where(eq(dbSchema.packageUpvotes.accountId, userId));

		// Suggestions
		const suggestions = await db
			.select()
			.from(dbSchema.suggestions)
			.where(eq(dbSchema.suggestions.accountId, userId));

		// Suggestion votes
		const suggestionVotes = await db
			.select()
			.from(dbSchema.suggestionVotes)
			.where(eq(dbSchema.suggestionVotes.accountId, userId));

		// Contribution events
		const contributionEvents = await db
			.select()
			.from(dbSchema.contributionEvents)
			.where(eq(dbSchema.contributionEvents.accountId, userId));

		// Contribution scores
		const [contributionScore] = await db
			.select()
			.from(dbSchema.contributionScores)
			.where(eq(dbSchema.contributionScores.accountId, userId));

		// Notifications
		const notifications = await db
			.select()
			.from(dbSchema.notifications)
			.where(eq(dbSchema.notifications.accountId, userId));

		return c.json({
			exportedAt: new Date().toISOString(),
			account: account ?? null,
			projects,
			projectUpvotes,
			projectMembers,
			projectPackages,
			upvotes,
			suggestions,
			suggestionVotes,
			contributionEvents,
			contributionScore: contributionScore ?? null,
			notifications,
		});
	} catch (error) {
		logger.error("Failed to export account data", { error: String(error) });
		return c.json({ error: "Failed to export data" }, 500);
	}
};

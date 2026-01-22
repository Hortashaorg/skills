import { z } from "@package/common";
import { defineMutator } from "@rocicorp/zero";
import { enums } from "../db/types.ts";
import { resolveApprovedSuggestion } from "../suggestions/resolution.ts";
import { zql } from "../zero-schema.gen.ts";
import { newRecord, now } from "./helpers.ts";

const APPROVE_THRESHOLD = 3;
const REJECT_THRESHOLD = 2;

export const vote = defineMutator(
	z.object({
		suggestionId: z.string(),
		vote: z.enum(enums.vote),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to vote");
		}

		const isAdmin = ctx.roles.includes("admin");

		// Get suggestion
		const suggestion = await tx.run(
			zql.suggestions.one().where("id", "=", args.suggestionId),
		);
		if (!suggestion) {
			throw new Error("Suggestion not found");
		}

		// Check suggestion is pending
		if (suggestion.status !== "pending") {
			throw new Error("Cannot vote on resolved suggestions");
		}

		// Check not self-voting (admins can vote on their own)
		if (suggestion.accountId === ctx.userID && !isAdmin) {
			throw new Error("Cannot vote on your own suggestion");
		}

		// Check not duplicate vote
		const existingVote = await tx.run(
			zql.suggestionVotes
				.where("suggestionId", args.suggestionId)
				.where("accountId", ctx.userID)
				.one(),
		);
		if (existingVote) {
			throw new Error("You have already voted on this suggestion");
		}

		// Create vote
		const record = newRecord();
		await tx.mutate.suggestionVotes.insert({
			id: record.id,
			suggestionId: args.suggestionId,
			accountId: ctx.userID,
			vote: args.vote,
			createdAt: record.now,
		});

		// Count votes to check threshold
		// Query runs after insert, so allVotes includes the vote we just added
		const allVotes = await tx.run(
			zql.suggestionVotes.where("suggestionId", args.suggestionId),
		);

		const approveCount = allVotes.filter((v) => v.vote === "approve").length;
		const rejectCount = allVotes.filter((v) => v.vote === "reject").length;

		// Check if threshold reached
		// - Admin vote = instant resolution
		// - Regular users need 3 approvals or 2 rejections
		let resolvedStatus: "approved" | "rejected" | null = null;
		if (isAdmin && args.vote === "approve") {
			resolvedStatus = "approved";
		} else if (isAdmin && args.vote === "reject") {
			resolvedStatus = "rejected";
		} else if (rejectCount >= REJECT_THRESHOLD) {
			resolvedStatus = "rejected";
		} else if (approveCount >= APPROVE_THRESHOLD) {
			resolvedStatus = "approved";
		}

		// Auto-resolve if threshold reached
		if (resolvedStatus) {
			const resolvedAt = now();

			await tx.mutate.suggestions.update({
				id: args.suggestionId,
				status: resolvedStatus,
				updatedAt: resolvedAt,
				resolvedAt,
			});

			// Apply the change if approved
			if (resolvedStatus === "approved") {
				await resolveApprovedSuggestion({ tx, suggestion });
			}

			// Award points to suggester
			const eventRecord = newRecord();
			await tx.mutate.contributionEvents.insert({
				id: eventRecord.id,
				accountId: suggestion.accountId,
				type:
					resolvedStatus === "approved"
						? "suggestion_approved"
						: "suggestion_rejected",
				points: resolvedStatus === "approved" ? 5 : -1,
				suggestionId: args.suggestionId,
				createdAt: eventRecord.now,
			});

			// Notify the suggester
			const notificationRecord = newRecord();
			await tx.mutate.notifications.insert({
				id: notificationRecord.id,
				accountId: suggestion.accountId,
				type:
					resolvedStatus === "approved"
						? "suggestion_approved"
						: "suggestion_rejected",
				title:
					resolvedStatus === "approved"
						? "Suggestion approved"
						: "Suggestion rejected",
				message:
					resolvedStatus === "approved"
						? "Your suggestion was approved and applied."
						: "Your suggestion was rejected by the community.",
				read: false,
				relatedId: args.suggestionId,
				createdAt: notificationRecord.now,
				updatedAt: notificationRecord.now,
			});

			// Award points to voters who matched outcome
			// Note: allVotes already includes the current vote (queried after insert)
			for (const v of allVotes) {
				const matched =
					(v.vote === "approve" && resolvedStatus === "approved") ||
					(v.vote === "reject" && resolvedStatus === "rejected");

				if (matched) {
					const voteEventRecord = newRecord();
					await tx.mutate.contributionEvents.insert({
						id: voteEventRecord.id,
						accountId: v.accountId,
						type: "vote_matched",
						points: 1,
						suggestionId: args.suggestionId,
						createdAt: voteEventRecord.now,
					});
				}
			}
		}
	},
);

import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";
import { enums } from "../db/types.ts";
import { zql } from "../zero-schema.gen.ts";
import { newRecord, now } from "./helpers.ts";

const APPROVE_THRESHOLD = 3;

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

		// Check not self-voting (admins can approve their own)
		if (suggestion.accountId === ctx.userID) {
			if (!isAdmin || args.vote !== "approve") {
				throw new Error("Cannot vote on your own suggestion");
			}
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
		const allVotes = await tx.run(
			zql.suggestionVotes.where("suggestionId", args.suggestionId),
		);

		// Include the vote we just added
		const approveCount =
			allVotes.filter((v) => v.vote === "approve").length +
			(args.vote === "approve" ? 1 : 0);
		const rejectCount =
			allVotes.filter((v) => v.vote === "reject").length +
			(args.vote === "reject" ? 1 : 0);

		// Check if threshold reached
		// - Admin approve = instant approval
		// - Any single rejection = instant rejection
		// - Regular users need 3 approvals
		let resolvedStatus: "approved" | "rejected" | null = null;
		if (isAdmin && args.vote === "approve") {
			resolvedStatus = "approved";
		} else if (rejectCount >= 1) {
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
			if (resolvedStatus === "approved" && suggestion.type === "add_tag") {
				const payload = suggestion.payload as { tagId: string };
				const tagRecord = newRecord();

				await tx.mutate.packageTags.insert({
					id: tagRecord.id,
					packageId: suggestion.packageId,
					tagId: payload.tagId,
					createdAt: tagRecord.now,
				});
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

			// Award points to voters who matched outcome (including current vote)
			const finalVotes = [
				...allVotes,
				{ accountId: ctx.userID, vote: args.vote },
			];

			for (const v of finalVotes) {
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

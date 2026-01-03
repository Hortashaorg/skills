import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";
import { zql } from "../zero-schema.gen.ts";
import { newRecord, now } from "./helpers.ts";

export const createAddTag = defineMutator(
	z.object({
		packageId: z.string(),
		tagId: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to create a suggestion");
		}

		// Validate package exists
		const pkg = await tx.run(
			zql.packages.one().where("id", "=", args.packageId),
		);
		if (!pkg) {
			throw new Error("Package not found");
		}

		// Validate tag exists
		const tag = await tx.run(zql.tags.one().where("id", "=", args.tagId));
		if (!tag) {
			throw new Error("Tag not found");
		}

		// Check tag not already on package
		const existingTag = await tx.run(
			zql.packageTags
				.where("packageId", args.packageId)
				.where("tagId", args.tagId)
				.one(),
		);
		if (existingTag) {
			throw new Error("Tag is already applied to this package");
		}

		// Check no duplicate pending suggestion from this user
		const existingPending = await tx.run(
			zql.suggestions
				.where("packageId", args.packageId)
				.where("accountId", ctx.userID)
				.where("type", "add_tag")
				.where("status", "pending"),
		);

		for (const suggestion of existingPending) {
			const payload = suggestion.payload as { tagId?: string };
			if (payload.tagId === args.tagId) {
				throw new Error("You already have a pending suggestion for this tag");
			}
		}

		const record = newRecord();

		await tx.mutate.suggestions.insert({
			id: record.id,
			packageId: args.packageId,
			accountId: ctx.userID,
			type: "add_tag",
			version: 1,
			payload: { tagId: args.tagId },
			status: "pending",
			createdAt: record.now,
			updatedAt: record.now,
			resolvedAt: null,
		});
	},
);

export const adminResolve = defineMutator(
	z.object({
		id: z.string(),
		status: z.enum(["approved", "rejected"]),
	}),
	async ({ tx, args, ctx }) => {
		if (!ctx.roles.includes("admin")) {
			throw new Error("Admin access required");
		}

		const suggestion = await tx.run(
			zql.suggestions.one().where("id", "=", args.id),
		);
		if (!suggestion) {
			throw new Error("Suggestion not found");
		}
		if (suggestion.status !== "pending") {
			throw new Error("Suggestion is already resolved");
		}

		const resolvedAt = now();

		// Update suggestion status
		await tx.mutate.suggestions.update({
			id: args.id,
			status: args.status,
			updatedAt: resolvedAt,
			resolvedAt,
		});

		// Apply the change if approved
		if (args.status === "approved" && suggestion.type === "add_tag") {
			const payload = suggestion.payload as { tagId: string };
			const record = newRecord();

			await tx.mutate.packageTags.insert({
				id: record.id,
				packageId: suggestion.packageId,
				tagId: payload.tagId,
				createdAt: record.now,
			});
		}

		// Award points to suggester
		const eventRecord = newRecord();
		await tx.mutate.contributionEvents.insert({
			id: eventRecord.id,
			accountId: suggestion.accountId,
			type:
				args.status === "approved"
					? "suggestion_approved"
					: "suggestion_rejected",
			points: args.status === "approved" ? 5 : -1,
			suggestionId: args.id,
			createdAt: eventRecord.now,
		});

		// Award points to voters who matched outcome
		const votes = await tx.run(
			zql.suggestionVotes.where("suggestionId", args.id),
		);

		for (const vote of votes) {
			const matched =
				(vote.vote === "approve" && args.status === "approved") ||
				(vote.vote === "reject" && args.status === "rejected");

			if (matched) {
				const voteEventRecord = newRecord();
				await tx.mutate.contributionEvents.insert({
					id: voteEventRecord.id,
					accountId: vote.accountId,
					type: "vote_matched",
					points: 1,
					suggestionId: args.id,
					createdAt: voteEventRecord.now,
				});
			}
		}
	},
);

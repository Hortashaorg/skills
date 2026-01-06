import { z } from "@package/common";
import { defineMutator } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";
import { newRecord } from "./helpers.ts";

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

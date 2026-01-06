import { z } from "@package/common";
import { defineMutator } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";
import { newRecord } from "./helpers.ts";

export const create = defineMutator(
	z.object({
		packageId: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to upvote");
		}

		const record = newRecord();

		await tx.mutate.packageUpvotes.insert({
			id: record.id,
			packageId: args.packageId,
			accountId: ctx.userID,
			createdAt: record.now,
		});

		// Update denormalized upvote count (without changing updatedAt)
		const pkg = await tx.run(
			zql.packages.one().where("id", "=", args.packageId),
		);

		if (pkg) {
			await tx.mutate.packages.update({
				id: args.packageId,
				upvoteCount: pkg.upvoteCount + 1,
			});
		}
	},
);

export const remove = defineMutator(
	z.object({
		id: z.string(),
		packageId: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to remove upvote");
		}

		const upvote = await tx.run(
			zql.packageUpvotes.one().where("id", "=", args.id),
		);
		if (!upvote || upvote.accountId !== ctx.userID) {
			throw new Error("Not authorized to remove this upvote");
		}

		await tx.mutate.packageUpvotes.delete({ id: args.id });

		// Update denormalized upvote count (without changing updatedAt)
		const pkg = await tx.run(
			zql.packages.one().where("id", "=", args.packageId),
		);
		if (pkg) {
			await tx.mutate.packages.update({
				id: args.packageId,
				upvoteCount: Math.max(0, pkg.upvoteCount - 1),
			});
		}
	},
);

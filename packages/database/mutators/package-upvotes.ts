import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";
import { zql } from "../zero-schema.gen.ts";
import { newRecord, now } from "./helpers.ts";

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

		// Update denormalized upvote count
		const pkg = await tx.run(
			zql.packages.one().where("id", "=", args.packageId),
		);

		if (pkg) {
			await tx.mutate.packages.update({
				id: args.packageId,
				upvoteCount: pkg.upvoteCount + 1,
				updatedAt: record.now,
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

		await tx.mutate.packageUpvotes.delete({ id: args.id });

		// Update denormalized upvote count
		const pkg = await tx.run(
			zql.packages.one().where("id", "=", args.packageId),
		);
		if (pkg) {
			await tx.mutate.packages.update({
				id: args.packageId,
				upvoteCount: Math.max(0, pkg.upvoteCount - 1),
				updatedAt: now(),
			});
		}
	},
);

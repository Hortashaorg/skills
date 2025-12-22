import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";
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
	},
);

export const remove = defineMutator(
	z.object({
		id: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to remove upvote");
		}

		await tx.mutate.packageUpvotes.delete({ id: args.id });
	},
);

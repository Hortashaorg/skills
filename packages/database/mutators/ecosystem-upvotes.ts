import { z } from "@package/common";
import { defineMutator } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";
import { newRecord } from "./helpers.ts";

export const create = defineMutator(
	z.object({
		ecosystemId: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to upvote");
		}

		const record = newRecord();

		await tx.mutate.ecosystemUpvotes.insert({
			id: record.id,
			ecosystemId: args.ecosystemId,
			accountId: ctx.userID,
			createdAt: record.now,
		});

		const ecosystem = await tx.run(
			zql.ecosystems.one().where("id", "=", args.ecosystemId),
		);

		if (ecosystem) {
			await tx.mutate.ecosystems.update({
				id: args.ecosystemId,
				upvoteCount: ecosystem.upvoteCount + 1,
			});
		}
	},
);

export const remove = defineMutator(
	z.object({
		id: z.string(),
		ecosystemId: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to remove upvote");
		}

		const upvote = await tx.run(
			zql.ecosystemUpvotes.one().where("id", "=", args.id),
		);
		if (!upvote || upvote.accountId !== ctx.userID) {
			throw new Error("Not authorized to remove this upvote");
		}

		await tx.mutate.ecosystemUpvotes.delete({ id: args.id });

		const ecosystem = await tx.run(
			zql.ecosystems.one().where("id", "=", args.ecosystemId),
		);
		if (ecosystem) {
			await tx.mutate.ecosystems.update({
				id: args.ecosystemId,
				upvoteCount: Math.max(0, ecosystem.upvoteCount - 1),
			});
		}
	},
);

import { z } from "@package/common";
import { defineMutator } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";
import { newRecord } from "./helpers.ts";

export const create = defineMutator(
	z.object({
		projectId: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to upvote");
		}

		const record = newRecord();

		await tx.mutate.projectUpvotes.insert({
			id: record.id,
			projectId: args.projectId,
			accountId: ctx.userID,
			createdAt: record.now,
		});

		const project = await tx.run(
			zql.projects.one().where("id", "=", args.projectId),
		);

		if (project) {
			await tx.mutate.projects.update({
				id: args.projectId,
				upvoteCount: project.upvoteCount + 1,
			});
		}
	},
);

export const remove = defineMutator(
	z.object({
		id: z.string(),
		projectId: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to remove upvote");
		}

		const upvote = await tx.run(
			zql.projectUpvotes.one().where("id", "=", args.id),
		);
		if (!upvote || upvote.accountId !== ctx.userID) {
			throw new Error("Not authorized to remove this upvote");
		}

		await tx.mutate.projectUpvotes.delete({ id: args.id });

		const project = await tx.run(
			zql.projects.one().where("id", "=", args.projectId),
		);
		if (project) {
			await tx.mutate.projects.update({
				id: args.projectId,
				upvoteCount: Math.max(0, project.upvoteCount - 1),
			});
		}
	},
);

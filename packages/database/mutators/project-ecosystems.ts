import { z } from "@package/common";
import { defineMutator } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";
import {
	deleteThreadWithComments,
	newRecord,
	now,
	requireProjectMember,
	resolveDefaultStatus,
} from "./helpers.ts";

export const add = defineMutator(
	z.object({
		projectId: z.string(),
		ecosystemId: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		await requireProjectMember(tx, args.projectId, ctx.userID);

		const record = newRecord();
		const status = await resolveDefaultStatus(tx, args.projectId);

		await tx.mutate.projectEcosystems.insert({
			id: record.id,
			projectId: args.projectId,
			ecosystemId: args.ecosystemId,
			status,
			createdAt: record.now,
			updatedAt: record.now,
		});

		await tx.mutate.projects.update({
			id: args.projectId,
			updatedAt: now(),
		});
	},
);

export const updateStatus = defineMutator(
	z.object({
		id: z.string(),
		projectId: z.string(),
		status: z.enum([
			"aware",
			"evaluating",
			"trialing",
			"approved",
			"adopted",
			"rejected",
			"phasing_out",
			"dropped",
		]),
	}),
	async ({ tx, args, ctx }) => {
		await requireProjectMember(tx, args.projectId, ctx.userID);

		await tx.mutate.projectEcosystems.update({
			id: args.id,
			status: args.status,
			updatedAt: now(),
		});

		await tx.mutate.projects.update({
			id: args.projectId,
			updatedAt: now(),
		});
	},
);

export const remove = defineMutator(
	z.object({
		id: z.string(),
		projectId: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		await requireProjectMember(tx, args.projectId, ctx.userID);

		// Cascade delete thread and comments
		const threads = await tx.run(
			zql.threads.where("projectEcosystemId", args.id),
		);
		const thread = threads[0];
		if (thread) {
			await deleteThreadWithComments(tx, thread.id);
		}

		await tx.mutate.projectEcosystems.delete({ id: args.id });

		await tx.mutate.projects.update({
			id: args.projectId,
			updatedAt: now(),
		});
	},
);

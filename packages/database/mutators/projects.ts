import { z } from "@package/common";
import { defineMutator } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";
import {
	deleteThreadWithComments,
	newRecord,
	now,
	requireProjectMember,
} from "./helpers.ts";

const DEFAULT_STATUSES = [
	{ status: "evaluating" as const, position: 0 },
	{ status: "adopted" as const, position: 1 },
	{ status: "dropped" as const, position: 2 },
];

export const create = defineMutator(
	z.object({
		name: z.string().min(1).max(100),
		description: z.string().max(500).optional(),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to create a project");
		}

		const record = newRecord();

		await tx.mutate.projects.insert({
			id: record.id,
			name: args.name,
			description: args.description ?? null,
			accountId: ctx.userID,
			upvoteCount: 0,
			createdAt: record.now,
			updatedAt: record.now,
		});

		for (const def of DEFAULT_STATUSES) {
			await tx.mutate.projectStatuses.insert({
				id: crypto.randomUUID(),
				projectId: record.id,
				status: def.status,
				position: def.position,
				createdAt: record.now,
				updatedAt: record.now,
			});
		}

		await tx.mutate.projectMembers.insert({
			id: crypto.randomUUID(),
			projectId: record.id,
			accountId: ctx.userID,
			role: "owner",
			createdAt: record.now,
			updatedAt: record.now,
		});
	},
);

export const update = defineMutator(
	z.object({
		id: z.string(),
		name: z.string().min(1).max(100).optional(),
		description: z.string().max(500).optional(),
	}),
	async ({ tx, args, ctx }) => {
		await requireProjectMember(tx, args.id, ctx.userID, "owner");

		await tx.mutate.projects.update({
			id: args.id,
			...(args.name !== undefined && { name: args.name }),
			...(args.description !== undefined && {
				description: args.description.trim() || null,
			}),
			updatedAt: now(),
		});
	},
);

export const remove = defineMutator(
	z.object({
		id: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		await requireProjectMember(tx, args.id, ctx.userID, "owner");

		// Delete threads and comments for all cards
		const projectPackages = await tx.run(
			zql.projectPackages.where("projectId", args.id),
		);
		for (const pp of projectPackages) {
			const threads = await tx.run(
				zql.threads.where("projectPackageId", pp.id),
			);
			for (const thread of threads) {
				await deleteThreadWithComments(tx, thread.id);
			}
			await tx.mutate.projectPackages.delete({ id: pp.id });
		}

		const projectEcosystems = await tx.run(
			zql.projectEcosystems.where("projectId", args.id),
		);
		for (const pe of projectEcosystems) {
			const threads = await tx.run(
				zql.threads.where("projectEcosystemId", pe.id),
			);
			for (const thread of threads) {
				await deleteThreadWithComments(tx, thread.id);
			}
			await tx.mutate.projectEcosystems.delete({ id: pe.id });
		}

		// Delete project-level thread
		const projectThreads = await tx.run(
			zql.threads.where("projectId", args.id),
		);
		for (const thread of projectThreads) {
			await deleteThreadWithComments(tx, thread.id);
		}

		const projectStatuses = await tx.run(
			zql.projectStatuses.where("projectId", args.id),
		);
		for (const ps of projectStatuses) {
			await tx.mutate.projectStatuses.delete({ id: ps.id });
		}

		const projectMembers = await tx.run(
			zql.projectMembers.where("projectId", args.id),
		);
		for (const pm of projectMembers) {
			await tx.mutate.projectMembers.delete({ id: pm.id });
		}

		const projectUpvotes = await tx.run(
			zql.projectUpvotes.where("projectId", args.id),
		);
		for (const pu of projectUpvotes) {
			await tx.mutate.projectUpvotes.delete({ id: pu.id });
		}

		await tx.mutate.projects.delete({ id: args.id });
	},
);

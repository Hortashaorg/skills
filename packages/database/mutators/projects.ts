import { z } from "@package/common";
import { defineMutator } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";
import { newRecord, now } from "./helpers.ts";

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
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to update a project");
		}

		const project = await tx.run(zql.projects.one().where("id", "=", args.id));
		if (!project || project.accountId !== ctx.userID) {
			throw new Error("Not authorized to update this project");
		}

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
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to delete a project");
		}

		const project = await tx.run(zql.projects.one().where("id", "=", args.id));
		if (!project || project.accountId !== ctx.userID) {
			throw new Error("Not authorized to delete this project");
		}

		// Delete associated records first (FK constraints)
		const projectPackages = await tx.run(
			zql.projectPackages.where("projectId", args.id),
		);
		for (const pp of projectPackages) {
			await tx.mutate.projectPackages.delete({ id: pp.id });
		}

		const projectEcosystems = await tx.run(
			zql.projectEcosystems.where("projectId", args.id),
		);
		for (const pe of projectEcosystems) {
			await tx.mutate.projectEcosystems.delete({ id: pe.id });
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

		await tx.mutate.projects.delete({ id: args.id });
	},
);

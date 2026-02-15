import { z } from "@package/common";
import { defineMutator } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";
import { newRecord, now, requireProjectMember } from "./helpers.ts";

export const add = defineMutator(
	z.object({
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
		await requireProjectMember(tx, args.projectId, ctx.userID, "owner");

		const existing = await tx.run(
			zql.projectStatuses
				.where("projectId", args.projectId)
				.where("status", args.status),
		);
		if (existing.length > 0) {
			throw new Error("Status column already exists");
		}

		const allStatuses = await tx.run(
			zql.projectStatuses.where("projectId", args.projectId),
		);
		const maxPosition = allStatuses.reduce(
			(max, s) => Math.max(max, s.position),
			-1,
		);

		const record = newRecord();
		await tx.mutate.projectStatuses.insert({
			id: record.id,
			projectId: args.projectId,
			status: args.status,
			position: maxPosition + 1,
			createdAt: record.now,
			updatedAt: record.now,
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
		await requireProjectMember(tx, args.projectId, ctx.userID, "owner");

		// If the removed status was the default, clear it
		const statusRecords = await tx.run(
			zql.projectStatuses.where("id", args.id),
		);
		const statusRecord = statusRecords[0];
		if (statusRecord) {
			const projects = await tx.run(zql.projects.where("id", args.projectId));
			const project = projects[0];
			if (project && project.defaultStatus === statusRecord.status) {
				await tx.mutate.projects.update({
					id: args.projectId,
					defaultStatus: null,
					updatedAt: now(),
				});
			}
		}

		await tx.mutate.projectStatuses.delete({ id: args.id });

		await tx.mutate.projects.update({
			id: args.projectId,
			updatedAt: now(),
		});
	},
);

export const swapPositions = defineMutator(
	z.object({
		projectId: z.string(),
		statusIdA: z.string(),
		statusIdB: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		await requireProjectMember(tx, args.projectId, ctx.userID, "owner");

		const allStatuses = await tx.run(
			zql.projectStatuses.where("projectId", args.projectId),
		);

		const a = allStatuses.find((s) => s.id === args.statusIdA);
		const b = allStatuses.find((s) => s.id === args.statusIdB);
		if (!a || !b) {
			throw new Error("Status not found");
		}

		await tx.mutate.projectStatuses.update({
			id: a.id,
			position: b.position,
			updatedAt: now(),
		});
		await tx.mutate.projectStatuses.update({
			id: b.id,
			position: a.position,
			updatedAt: now(),
		});

		await tx.mutate.projects.update({
			id: args.projectId,
			updatedAt: now(),
		});
	},
);

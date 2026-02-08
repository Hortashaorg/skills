import { z } from "@package/common";
import { defineMutator } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";
import { newRecord, now } from "./helpers.ts";

export const add = defineMutator(
	z.object({
		projectId: z.string(),
		ecosystemId: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to add ecosystem to project");
		}

		const project = await tx.run(
			zql.projects.one().where("id", "=", args.projectId),
		);
		if (!project || project.accountId !== ctx.userID) {
			throw new Error("Not authorized to modify this project");
		}

		const record = newRecord();

		await tx.mutate.projectEcosystems.insert({
			id: record.id,
			projectId: args.projectId,
			ecosystemId: args.ecosystemId,
			status: "evaluating",
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
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to update ecosystem status");
		}

		const project = await tx.run(
			zql.projects.one().where("id", "=", args.projectId),
		);
		if (!project || project.accountId !== ctx.userID) {
			throw new Error("Not authorized to modify this project");
		}

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
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to remove ecosystem from project");
		}

		const project = await tx.run(
			zql.projects.one().where("id", "=", args.projectId),
		);
		if (!project || project.accountId !== ctx.userID) {
			throw new Error("Not authorized to modify this project");
		}

		await tx.mutate.projectEcosystems.delete({ id: args.id });

		await tx.mutate.projects.update({
			id: args.projectId,
			updatedAt: now(),
		});
	},
);

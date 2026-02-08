import { z } from "@package/common";
import { defineMutator } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";
import { newRecord, now } from "./helpers.ts";

export const add = defineMutator(
	z.object({
		projectId: z.string(),
		packageId: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to add package to project");
		}

		const project = await tx.run(
			zql.projects.one().where("id", "=", args.projectId),
		);
		if (!project || project.accountId !== ctx.userID) {
			throw new Error("Not authorized to modify this project");
		}

		const record = newRecord();

		await tx.mutate.projectPackages.insert({
			id: record.id,
			projectId: args.projectId,
			packageId: args.packageId,
			status: "evaluating",
			createdAt: record.now,
			updatedAt: record.now,
		});

		// Update project's updatedAt
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
			throw new Error("Must be logged in to update package status");
		}

		const project = await tx.run(
			zql.projects.one().where("id", "=", args.projectId),
		);
		if (!project || project.accountId !== ctx.userID) {
			throw new Error("Not authorized to modify this project");
		}

		await tx.mutate.projectPackages.update({
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
			throw new Error("Must be logged in to remove package from project");
		}

		const project = await tx.run(
			zql.projects.one().where("id", "=", args.projectId),
		);
		if (!project || project.accountId !== ctx.userID) {
			throw new Error("Not authorized to modify this project");
		}

		await tx.mutate.projectPackages.delete({ id: args.id });

		// Update project's updatedAt
		await tx.mutate.projects.update({
			id: args.projectId,
			updatedAt: now(),
		});
	},
);

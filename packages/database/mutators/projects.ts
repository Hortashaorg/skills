import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";
import { newRecord, now } from "./helpers.ts";

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

		await tx.mutate.projects.update({
			id: args.id,
			...(args.name !== undefined && { name: args.name }),
			...(args.description !== undefined && { description: args.description }),
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

		await tx.mutate.projects.delete({ id: args.id });
	},
);

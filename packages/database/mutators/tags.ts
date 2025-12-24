import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";
import { newRecord, now } from "./helpers.ts";

const slugify = (text: string): string =>
	text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");

export const create = defineMutator(
	z.object({
		name: z.string().min(1).max(50),
		description: z.string().max(200).optional(),
	}),
	async ({ tx, args, ctx }) => {
		if (!ctx.roles.includes("admin")) {
			throw new Error("Admin access required");
		}

		const record = newRecord();
		const slug = slugify(args.name);

		await tx.mutate.tags.insert({
			id: record.id,
			name: args.name,
			slug,
			description: args.description ?? null,
			createdAt: record.now,
			updatedAt: record.now,
		});
	},
);

export const update = defineMutator(
	z.object({
		id: z.string(),
		name: z.string().min(1).max(50),
		description: z.string().max(200).optional(),
	}),
	async ({ tx, args, ctx }) => {
		if (!ctx.roles.includes("admin")) {
			throw new Error("Admin access required");
		}

		const slug = slugify(args.name);

		await tx.mutate.tags.update({
			id: args.id,
			name: args.name,
			slug,
			description: args.description ?? null,
			updatedAt: now(),
		});
	},
);

export const remove = defineMutator(
	z.object({
		id: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		if (!ctx.roles.includes("admin")) {
			throw new Error("Admin access required");
		}

		await tx.mutate.tags.delete({ id: args.id });
	},
);

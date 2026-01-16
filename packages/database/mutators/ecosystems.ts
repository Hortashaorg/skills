import { z } from "@package/common";
import { defineMutator } from "@rocicorp/zero";
import { newRecord, now } from "./helpers.ts";

export const create = defineMutator(
	z.object({
		name: z.string(),
		slug: z.string(),
		description: z.string().optional(),
		website: z.string().optional(),
	}),
	async ({ tx, args, ctx }) => {
		if (!ctx.roles.includes("admin")) {
			throw new Error("Admin access required");
		}

		const record = newRecord();

		await tx.mutate.ecosystems.insert({
			id: record.id,
			name: args.name,
			slug: args.slug,
			description: args.description ?? null,
			website: args.website ?? null,
			upvoteCount: 0,
			createdAt: record.now,
			updatedAt: record.now,
		});
	},
);

export const update = defineMutator(
	z.object({
		id: z.string(),
		name: z.string().optional(),
		slug: z.string().optional(),
		description: z.string().optional(),
		website: z.string().optional(),
	}),
	async ({ tx, args, ctx }) => {
		if (!ctx.roles.includes("admin")) {
			throw new Error("Admin access required");
		}

		await tx.mutate.ecosystems.update({
			id: args.id,
			...(args.name !== undefined && { name: args.name }),
			...(args.slug !== undefined && { slug: args.slug }),
			...(args.description !== undefined && { description: args.description }),
			...(args.website !== undefined && { website: args.website }),
			updatedAt: now(),
		});
	},
);

export const remove = defineMutator(
	z.object({ id: z.string() }),
	async ({ tx, args, ctx }) => {
		if (!ctx.roles.includes("admin")) {
			throw new Error("Admin access required");
		}

		await tx.mutate.ecosystems.delete({ id: args.id });
	},
);

import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";

export const create = defineMutator(
	z.object({
		name: z.string().min(1),
		slug: z.string().min(1),
		description: z.string().optional(),
		color: z.string().optional(),
	}),
	async ({ tx, args }) => {
		// TODO: Check if user is admin
		// if (!ctx.roles?.includes('admin')) throw new Error('Unauthorized');

		const id = crypto.randomUUID();
		const now = Date.now();

		await tx.mutate.tags.insert({
			id,
			name: args.name,
			slug: args.slug,
			description: args.description ?? null,
			color: args.color ?? null,
			createdAt: now,
			updatedAt: now,
		});
	},
);

export const update = defineMutator(
	z.object({
		id: z.string(),
		name: z.string().min(1).optional(),
		slug: z.string().min(1).optional(),
		description: z.string().optional(),
		color: z.string().optional(),
	}),
	async ({ tx, args }) => {
		// TODO: Check if user is admin
		// if (!ctx.roles?.includes('admin')) throw new Error('Unauthorized');

		const updates: {
			id: string;
			name?: string;
			slug?: string;
			description?: string | null;
			color?: string | null;
			updatedAt: number;
		} = {
			id: args.id,
			updatedAt: Date.now(),
		};

		if (args.name !== undefined) updates.name = args.name;
		if (args.slug !== undefined) updates.slug = args.slug;
		if (args.description !== undefined)
			updates.description = args.description || null;
		if (args.color !== undefined) updates.color = args.color || null;

		await tx.mutate.tags.update(updates);
	},
);

export const remove = defineMutator(
	z.object({ id: z.string() }),
	async ({ tx, args }) => {
		// TODO: Check if user is admin
		// if (!ctx.roles?.includes('admin')) throw new Error('Unauthorized');

		// Hard delete - FK constraint will prevent if packageTags exist
		await tx.mutate.tags.delete({ id: args.id });
	},
);

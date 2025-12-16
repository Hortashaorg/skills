import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";

export const create = defineMutator(
	z.object({
		name: z.string().min(1),
		description: z.string().optional(),
	}),
	async ({ tx, args }) => {
		const id = crypto.randomUUID();
		const now = Date.now();
		await tx.mutate.tech.insert({
			id,
			name: args.name,
			description: args.description ?? null,
			createdAt: now,
			updatedAt: now,
		});
	},
);

export const update = defineMutator(
	z.object({
		id: z.string(),
		name: z.string().min(1).optional(),
		description: z.string().optional(),
	}),
	async ({ tx, args }) => {
		const updates: {
			id: string;
			name?: string;
			description?: string | null;
			updatedAt: number;
		} = {
			id: args.id,
			updatedAt: Date.now(),
		};
		if (args.name !== undefined) updates.name = args.name;
		if (args.description !== undefined) updates.description = args.description;

		await tx.mutate.tech.update(updates);
	},
);

export const remove = defineMutator(
	z.object({ id: z.string() }),
	async ({ tx, args }) => {
		await tx.mutate.tech.delete({ id: args.id });
	},
);

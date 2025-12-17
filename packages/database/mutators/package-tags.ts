import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";

export const create = defineMutator(
	z.object({
		packageId: z.string(),
		tagId: z.string(),
	}),
	async ({ tx, args }) => {
		// TODO: Check if user is admin
		// if (!ctx.roles?.includes('admin')) throw new Error('Unauthorized');

		const id = crypto.randomUUID();
		const now = Date.now();

		await tx.mutate.packageTags.insert({
			id,
			packageId: args.packageId,
			tagId: args.tagId,
			createdAt: now,
		});

		// TODO: Create audit log entry
		// await tx.mutate.auditLog.insert({ ... })
	},
);

export const remove = defineMutator(
	z.object({
		packageId: z.string(),
		tagId: z.string(),
	}),
	async () => {
		// TODO: Check if user is admin
		// if (!ctx.roles?.includes('admin')) throw new Error('Unauthorized');
		// TODO: Hard delete the association
		// Note: Zero doesn't support WHERE with multiple conditions directly
		// May need to query first, then delete by ID
		// Or use a raw SQL mutator
		// TODO: Create audit log entry for removal
	},
);

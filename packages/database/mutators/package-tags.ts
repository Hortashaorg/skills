import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";
import { newRecord } from "./helpers.ts";

export const create = defineMutator(
	z.object({
		packageId: z.string(),
		tagId: z.string(),
	}),
	async ({ tx, args }) => {
		// TODO: Check if user is admin
		// if (!ctx.roles?.includes('admin')) throw new Error('Unauthorized');

		const record = newRecord();

		await tx.mutate.packageTags.insert({
			id: record.id,
			packageId: args.packageId,
			tagId: args.tagId,
			createdAt: record.now,
		});

		// TODO: Create audit log entry
		// await tx.mutate.auditLog.insert({ ... })
	},
);

export const remove = defineMutator(
	z.object({
		id: z.string(),
	}),
	async ({ tx, args }) => {
		// TODO: Check if user is admin
		// TODO: Create audit log entry for removal
		await tx.mutate.packageTags.delete({ id: args.id });
	},
);

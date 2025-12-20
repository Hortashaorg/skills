import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";
import { newRecord } from "./helpers.ts";

export const create = defineMutator(
	z.object({
		packageId: z.string(),
		tagId: z.string(),
	}),
	async ({ tx, args }) => {
		const record = newRecord();

		await tx.mutate.packageTags.insert({
			id: record.id,
			packageId: args.packageId,
			tagId: args.tagId,
			createdAt: record.now,
		});
	},
);

export const remove = defineMutator(
	z.object({
		id: z.string(),
	}),
	async ({ tx, args }) => {
		await tx.mutate.packageTags.delete({ id: args.id });
	},
);

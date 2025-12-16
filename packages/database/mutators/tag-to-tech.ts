import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";

export const add = defineMutator(
	z.object({
		techId: z.string(),
		tagId: z.string(),
	}),
	async ({ tx, args }) => {
		await tx.mutate.tagToTech.insert({
			techId: args.techId,
			tagId: args.tagId,
		});
	},
);

export const remove = defineMutator(
	z.object({
		techId: z.string(),
		tagId: z.string(),
	}),
	async ({ tx, args }) => {
		await tx.mutate.tagToTech.delete({
			techId: args.techId,
			tagId: args.tagId,
		});
	},
);

import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";

export const create = defineMutator(
	z.object({
		packageId: z.string(),
		version: z.string(),
		publishedAt: z.number(),
	}),
	async ({ tx, args }) => {
		const id = crypto.randomUUID();
		const now = Date.now();

		await tx.mutate.packageVersions.insert({
			id,
			packageId: args.packageId,
			version: args.version,
			publishedAt: args.publishedAt,
			createdAt: now,
		});
	},
);

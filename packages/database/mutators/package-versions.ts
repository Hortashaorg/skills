import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";
import { newRecord } from "./helpers.ts";

export const create = defineMutator(
	z.object({
		packageId: z.string(),
		version: z.string(),
		publishedAt: z.number(),
	}),
	async ({ tx, args }) => {
		const record = newRecord();

		await tx.mutate.packageVersions.insert({
			id: record.id,
			packageId: args.packageId,
			version: args.version,
			publishedAt: args.publishedAt,
			createdAt: record.now,
		});
	},
);

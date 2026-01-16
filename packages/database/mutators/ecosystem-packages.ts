import { z } from "@package/common";
import { defineMutator } from "@rocicorp/zero";
import { newRecord, now } from "./helpers.ts";

export const add = defineMutator(
	z.object({
		ecosystemId: z.string(),
		packageId: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		if (!ctx.roles.includes("admin")) {
			throw new Error("Admin access required");
		}

		const record = newRecord();

		await tx.mutate.ecosystemPackages.insert({
			id: record.id,
			ecosystemId: args.ecosystemId,
			packageId: args.packageId,
			createdAt: record.now,
		});

		await tx.mutate.ecosystems.update({
			id: args.ecosystemId,
			updatedAt: now(),
		});
	},
);

export const remove = defineMutator(
	z.object({
		id: z.string(),
		ecosystemId: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		if (!ctx.roles.includes("admin")) {
			throw new Error("Admin access required");
		}

		await tx.mutate.ecosystemPackages.delete({ id: args.id });

		await tx.mutate.ecosystems.update({
			id: args.ecosystemId,
			updatedAt: now(),
		});
	},
);

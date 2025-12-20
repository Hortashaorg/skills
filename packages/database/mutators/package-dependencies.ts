import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";
import { enums } from "../db/types.ts";
import { newRecord, now } from "./helpers.ts";

export const create = defineMutator(
	z.object({
		packageId: z.string(),
		versionId: z.string(),
		dependencyName: z.string(),
		dependencyPackageId: z.string().optional(),
		dependencyVersionRange: z.string(),
		dependencyType: z.enum(enums.dependencyType),
	}),
	async ({ tx, args }) => {
		const record = newRecord();

		await tx.mutate.packageDependencies.insert({
			id: record.id,
			packageId: args.packageId,
			versionId: args.versionId,
			dependencyName: args.dependencyName,
			dependencyPackageId: args.dependencyPackageId ?? null,
			dependencyVersionRange: args.dependencyVersionRange,
			dependencyType: args.dependencyType,
			createdAt: record.now,
			updatedAt: record.now,
		});
	},
);

export const linkPackage = defineMutator(
	z.object({
		id: z.string(),
		dependencyPackageId: z.string(),
	}),
	async ({ tx, args }) => {
		await tx.mutate.packageDependencies.update({
			id: args.id,
			dependencyPackageId: args.dependencyPackageId,
			updatedAt: now(),
		});
	},
);

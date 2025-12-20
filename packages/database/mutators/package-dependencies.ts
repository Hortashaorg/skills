import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";
import { enums } from "../db/types.ts";

export const create = defineMutator(
	z.object({
		packageId: z.string(),
		versionId: z.string(),
		dependencyName: z.string(),
		dependencyPackageId: z.string().optional(),
		dependencyVersionRange: z.string(),
		resolvedVersion: z.string(),
		resolvedVersionId: z.string().optional(),
		dependencyType: z.enum(enums.dependencyType),
	}),
	async ({ tx, args }) => {
		const id = crypto.randomUUID();
		const now = Date.now();

		await tx.mutate.packageDependencies.insert({
			id,
			packageId: args.packageId,
			versionId: args.versionId,
			dependencyName: args.dependencyName,
			dependencyPackageId: args.dependencyPackageId ?? null,
			dependencyVersionRange: args.dependencyVersionRange,
			resolvedVersion: args.resolvedVersion,
			resolvedVersionId: args.resolvedVersionId ?? null,
			dependencyType: args.dependencyType,
			createdAt: now,
			updatedAt: now,
		});
	},
);

export const linkPackage = defineMutator(
	z.object({
		id: z.string(),
		dependencyPackageId: z.string(),
		resolvedVersionId: z.string().optional(),
	}),
	async ({ tx, args }) => {
		const updates: {
			id: string;
			dependencyPackageId: string;
			resolvedVersionId?: string;
			updatedAt: number;
		} = {
			id: args.id,
			dependencyPackageId: args.dependencyPackageId,
			updatedAt: Date.now(),
		};

		if (args.resolvedVersionId) {
			updates.resolvedVersionId = args.resolvedVersionId;
		}

		await tx.mutate.packageDependencies.update(updates);
	},
);

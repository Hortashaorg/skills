import { z } from "@package/common";
import { defineMutator } from "@rocicorp/zero";
import { enums } from "../db/types.ts";
import { zql } from "../zero-schema.gen.ts";
import { newRecord } from "./helpers.ts";

export const requestPackage = defineMutator(
	z.object({
		name: z.string(),
		registry: z.enum(enums.registry),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to request packages");
		}

		// Check if package already exists
		const existing = await tx.run(
			zql.packages
				.where("name", args.name)
				.where("registry", args.registry)
				.one(),
		);

		let packageId: string;

		if (existing) {
			// Existing package - just create a fetch request
			packageId = existing.id;
		} else {
			// New package - create placeholder
			const record = newRecord();
			packageId = record.id;

			await tx.mutate.packages.insert({
				id: record.id,
				name: args.name,
				registry: args.registry,
				status: "placeholder",
				failureReason: null,
				description: null,
				homepage: null,
				repository: null,
				latestVersion: null,
				distTags: null,
				upvoteCount: 0,
				lastFetchAttempt: 0,
				lastFetchSuccess: 0,
				createdAt: record.now,
				updatedAt: record.now,
			});
		}

		// Create pending fetch for the package
		const fetchRecord = newRecord();
		await tx.mutate.packageFetches.insert({
			id: fetchRecord.id,
			packageId,
			status: "pending",
			errorMessage: null,
			createdAt: fetchRecord.now,
			completedAt: null,
		});
	},
);

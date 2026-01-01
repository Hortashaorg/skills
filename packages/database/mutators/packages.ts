import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";
import { enums } from "../db/types.ts";
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

		const record = newRecord();

		// Create placeholder package
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

		// Create pending fetch for the package
		const fetchRecord = newRecord();
		await tx.mutate.packageFetches.insert({
			id: fetchRecord.id,
			packageId: record.id,
			status: "pending",
			errorMessage: null,
			createdAt: fetchRecord.now,
			completedAt: null,
		});
	},
);

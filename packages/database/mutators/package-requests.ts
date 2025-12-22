import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";
import { enums } from "../db/types.ts";
import { newRecord } from "./helpers.ts";

export const create = defineMutator(
	z.object({
		packageName: z.string(),
		registry: z.enum(enums.registry),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to request packages");
		}

		const record = newRecord();

		await tx.mutate.packageRequests.insert({
			id: record.id,
			packageName: args.packageName,
			registry: args.registry,
			status: "pending",
			errorMessage: null,
			packageId: null,
			attemptCount: 0,
			createdAt: record.now,
			updatedAt: record.now,
		});
	},
);

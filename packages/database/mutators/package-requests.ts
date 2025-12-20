import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";
import { enums } from "../db/types.ts";
import { newRecord, now } from "./helpers.ts";

export const create = defineMutator(
	z.object({
		packageName: z.string(),
		registry: z.enum(enums.registry),
	}),
	async ({ tx, args }) => {
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

export const markFetching = defineMutator(
	z.object({ id: z.string() }),
	async ({ tx, args }) => {
		await tx.mutate.packageRequests.update({
			id: args.id,
			status: "fetching",
			updatedAt: now(),
		});
	},
);

export const markCompleted = defineMutator(
	z.object({
		id: z.string(),
		packageId: z.string(),
	}),
	async ({ tx, args }) => {
		await tx.mutate.packageRequests.update({
			id: args.id,
			status: "completed",
			packageId: args.packageId,
			updatedAt: now(),
		});
	},
);

export const markFailed = defineMutator(
	z.object({
		id: z.string(),
		errorMessage: z.string(),
		attemptCount: z.number(),
	}),
	async ({ tx, args }) => {
		const status = args.attemptCount >= 3 ? "discarded" : "failed";

		await tx.mutate.packageRequests.update({
			id: args.id,
			status,
			errorMessage: args.errorMessage,
			attemptCount: args.attemptCount,
			updatedAt: now(),
		});
	},
);

export const incrementAttempt = defineMutator(
	z.object({
		id: z.string(),
		attemptCount: z.number(),
	}),
	async ({ tx, args }) => {
		await tx.mutate.packageRequests.update({
			id: args.id,
			attemptCount: args.attemptCount,
			updatedAt: now(),
		});
	},
);

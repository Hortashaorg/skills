import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";
import { enums } from "../db/types.ts";
import { newRecord, now } from "./helpers.ts";

export const upsert = defineMutator(
	z.object({
		id: z.string().optional(),
		name: z.string(),
		registry: z.enum(enums.registry),
		description: z.string().optional(),
		homepage: z.string().optional(),
		repository: z.string().optional(),
		lastFetchAttempt: z.number(),
		lastFetchSuccess: z.number(),
	}),
	async ({ tx, args }) => {
		const record = newRecord();
		const id = args.id ?? record.id;

		await tx.mutate.packages.upsert({
			id,
			name: args.name,
			registry: args.registry,
			description: args.description ?? null,
			homepage: args.homepage ?? null,
			repository: args.repository ?? null,
			lastFetchAttempt: args.lastFetchAttempt,
			lastFetchSuccess: args.lastFetchSuccess,
			createdAt: record.now,
			updatedAt: record.now,
		});
	},
);

export const updateFetchTimestamps = defineMutator(
	z.object({
		id: z.string(),
		lastFetchAttempt: z.number(),
		lastFetchSuccess: z.number().optional(),
	}),
	async ({ tx, args }) => {
		const updates: {
			id: string;
			lastFetchAttempt: number;
			lastFetchSuccess?: number;
			updatedAt: number;
		} = {
			id: args.id,
			lastFetchAttempt: args.lastFetchAttempt,
			updatedAt: now(),
		};

		if (args.lastFetchSuccess !== undefined) {
			updates.lastFetchSuccess = args.lastFetchSuccess;
		}

		await tx.mutate.packages.update(updates);
	},
);

import { z } from "@package/common";
import type { ReadonlyJSONObject, ReadonlyJSONValue } from "@rocicorp/zero";
import { defineMutator } from "@rocicorp/zero";
import { isPowerUser } from "../suggestions/power-user.ts";
import {
	getSuggestionType,
	suggestionTypeKeys,
} from "../suggestions/types/index.ts";
import { newRecord } from "./helpers.ts";

const jsonObject = z.custom<ReadonlyJSONObject>(
	(val): val is ReadonlyJSONObject =>
		typeof val === "object" && val !== null && !Array.isArray(val),
);

/**
 * Generic suggestion creation mutator.
 * Validates payload with type's schema, stores suggestion, and auto-applies for power users.
 */
export const create = defineMutator(
	z.object({
		type: z.enum(suggestionTypeKeys),
		packageId: z.string().optional(),
		ecosystemId: z.string().optional(),
		payload: jsonObject,
		justification: z.string().max(500).optional(),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to create a suggestion");
		}

		const typeDef = getSuggestionType(args.type);
		if (!typeDef) {
			throw new Error(`Unknown suggestion type: ${args.type}`);
		}

		// Parse with current version schema
		const schema = typeDef.schemas[typeDef.currentVersion];
		if (!schema) {
			throw new Error(`No schema for ${args.type} v${typeDef.currentVersion}`);
		}
		const payload = schema.parse(args.payload);

		// Run validation if defined
		const ids = {
			packageId: args.packageId ?? null,
			ecosystemId: args.ecosystemId ?? null,
		};
		if (typeDef.validate) {
			await typeDef.validate({ tx, userId: ctx.userID }, payload, ids);
		}

		// Store suggestion
		const record = newRecord();
		const powerUser = isPowerUser(ctx.roles);

		await tx.mutate.suggestions.insert({
			id: record.id,
			packageId: args.packageId ?? null,
			ecosystemId: args.ecosystemId ?? null,
			accountId: ctx.userID,
			type: args.type,
			version: typeDef.currentVersion,
			payload: payload as ReadonlyJSONValue,
			justification: args.justification ?? null,
			status: powerUser ? "approved" : "pending",
			createdAt: record.now,
			updatedAt: record.now,
			resolvedAt: powerUser ? record.now : null,
		});

		// Auto-apply for power users
		if (powerUser) {
			await typeDef.resolve(tx, payload, {
				packageId: args.packageId ?? null,
				ecosystemId: args.ecosystemId ?? null,
			});
		}
	},
);

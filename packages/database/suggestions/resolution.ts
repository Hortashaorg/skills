/**
 * Resolution handlers for approved suggestions.
 *
 * Called by both adminResolve and vote auto-resolve mutators.
 */

import type { SuggestionType } from "../db/types.ts";
import { newRecord } from "../mutators/helpers.ts";
import { parsePayload } from "./schemas.ts";

/** Context passed to resolution handlers */
export interface ResolutionContext {
	tx: {
		mutate: {
			packageTags: {
				insert: (data: {
					id: string;
					packageId: string;
					tagId: string;
					createdAt: number;
				}) => Promise<void>;
			};
		};
	};
	suggestion: {
		id: string;
		packageId: string;
		type: string;
		version: number;
		payload: unknown;
		accountId: string;
	};
}

/** Resolution handlers - apply the change when a suggestion is approved */
export const resolutionHandlers: Record<
	SuggestionType,
	(ctx: ResolutionContext) => Promise<void>
> = {
	add_tag: async ({ tx, suggestion }) => {
		const payload = parsePayload(
			"add_tag",
			suggestion.version,
			suggestion.payload,
		) as { tagId: string } | null;
		if (!payload) {
			throw new Error("Invalid add_tag payload");
		}

		const record = newRecord();
		await tx.mutate.packageTags.insert({
			id: record.id,
			packageId: suggestion.packageId,
			tagId: payload.tagId,
			createdAt: record.now,
		});
	},
};

/**
 * Execute resolution handler for a suggestion type.
 * Returns true if handler was found and executed.
 */
export async function resolveApprovedSuggestion(
	ctx: ResolutionContext,
): Promise<boolean> {
	const handler = resolutionHandlers[ctx.suggestion.type as SuggestionType];
	if (!handler) return false;
	await handler(ctx);
	return true;
}

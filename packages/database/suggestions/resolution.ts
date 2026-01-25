/**
 * Resolution handlers for approved suggestions.
 */

import type { SuggestionTransaction } from "./types/definition.ts";
import { getSchema, getSuggestionType } from "./types/index.ts";

export interface ResolutionContext {
	tx: SuggestionTransaction;
	suggestion: {
		id: string;
		packageId: string | null;
		ecosystemId: string | null;
		type: string;
		version: number;
		payload: unknown;
	};
}

/**
 * Execute resolution for an approved suggestion.
 * Parses payload with the correct schema version and calls resolve.
 */
export async function resolveApprovedSuggestion(
	ctx: ResolutionContext,
): Promise<void> {
	const typeDef = getSuggestionType(ctx.suggestion.type);
	if (!typeDef) {
		throw new Error(`Unknown suggestion type: ${ctx.suggestion.type}`);
	}

	const schema = getSchema(ctx.suggestion.type, ctx.suggestion.version);
	if (!schema) {
		throw new Error(
			`No schema for ${ctx.suggestion.type} v${ctx.suggestion.version}`,
		);
	}

	const payload = schema.parse(ctx.suggestion.payload);
	await typeDef.resolve(ctx.tx, payload, {
		packageId: ctx.suggestion.packageId,
		ecosystemId: ctx.suggestion.ecosystemId,
	});
}

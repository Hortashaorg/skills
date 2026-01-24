/**
 * Display helpers for suggestion types.
 * Safe to use in frontend code.
 */

import type { SuggestionType } from "../db/types.ts";
import type { FormatContext } from "./types/definition.ts";
import {
	formatAction,
	formatDescription,
	getSuggestionTypeLabel,
	suggestionTypes,
} from "./types/index.ts";

export { getSuggestionTypeLabel };
export type { FormatContext };

/** Type metadata for display */
export const suggestionTypeMeta: Record<SuggestionType, { label: string }> =
	Object.fromEntries(
		Object.entries(suggestionTypes).map(([key, def]) => [
			key,
			{ label: def.label },
		]),
	) as Record<SuggestionType, { label: string }>;

/**
 * Format suggestion description with version support.
 */
export function formatSuggestionDescription(
	type: string,
	payload: unknown,
	version: number,
	ctx: FormatContext,
): string {
	return formatDescription(type, payload, version, ctx);
}

/**
 * Format suggestion action with version support.
 */
export function formatSuggestionAction(
	type: string,
	payload: unknown,
	version: number,
	ctx: FormatContext,
): string {
	return formatAction(type, payload, version, ctx);
}

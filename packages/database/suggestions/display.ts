/**
 * Display helpers for suggestion types.
 * Safe to use in frontend code.
 */

import type { SuggestionType } from "../db/types.ts";
import type { FormatContext, SuggestionDisplay } from "./types/definition.ts";
import {
	formatDisplay,
	getSuggestionTypeLabel,
	suggestionTypes,
} from "./types/index.ts";

export { getSuggestionTypeLabel };
export type { FormatContext, SuggestionDisplay };

/** Type metadata for display */
export const suggestionTypeMeta: Record<SuggestionType, { label: string }> =
	Object.fromEntries(
		Object.entries(suggestionTypes).map(([key, def]) => [
			key,
			{ label: def.label },
		]),
	) as Record<SuggestionType, { label: string }>;

/**
 * Format display data with resolved context maps.
 */
export function formatSuggestionDisplay(
	type: string,
	payload: unknown,
	version: number,
	ctx: FormatContext = {},
): SuggestionDisplay {
	return formatDisplay(type, payload, version, ctx);
}

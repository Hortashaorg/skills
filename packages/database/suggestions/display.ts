/**
 * Display helpers for suggestion types.
 *
 * These are safe to use in frontend code.
 */

import type { SuggestionType } from "../db/types.ts";

/** Type metadata for display */
export const suggestionTypeMeta: Record<
	SuggestionType,
	{
		/** Badge/label text */
		label: string;
	}
> = {
	add_tag: { label: "Add tag" },
};

/** Get label for a suggestion type */
export function getSuggestionTypeLabel(type: string): string {
	return (
		suggestionTypeMeta[type as SuggestionType]?.label ??
		type.replaceAll("_", " ")
	);
}

/** Context for formatting suggestion descriptions */
interface SuggestionContext {
	tags?: Map<string, { name: string }>;
}

/**
 * Format a human-readable description for a suggestion.
 *
 * @param type - Suggestion type (e.g., "add_tag")
 * @param payload - The suggestion payload
 * @param context - Lookup maps for resolving IDs to names
 * @returns Formatted description string
 */
export function formatSuggestionDescription(
	type: string,
	payload: unknown,
	context: SuggestionContext,
): string {
	if (type === "add_tag") {
		const tagId = (payload as { tagId?: string })?.tagId;
		const tagName = tagId ? context.tags?.get(tagId)?.name : undefined;
		return tagName ?? "Unknown tag";
	}

	return getSuggestionTypeLabel(type);
}

/**
 * Format a full suggestion action description.
 * Example: 'Add tag "react"'
 */
export function formatSuggestionAction(
	type: string,
	payload: unknown,
	context: SuggestionContext,
): string {
	const description = formatSuggestionDescription(type, payload, context);

	if (type === "add_tag") {
		return `Add tag "${description}"`;
	}

	return description;
}

/**
 * Suggestion Types Registry
 *
 * Adding a new suggestion type:
 * 1. Create a new file in this folder (e.g., my-type.ts)
 * 2. Import and add it to suggestionTypes below
 * 3. Add the enum value to db/schema/enums.ts
 */

import { addEcosystemPackage } from "./add-ecosystem-package.ts";
import { addEcosystemTag } from "./add-ecosystem-tag.ts";
import { addTag } from "./add-tag.ts";
import { createEcosystem } from "./create-ecosystem.ts";
import { removeEcosystemTag } from "./remove-ecosystem-tag.ts";
import { removeTag } from "./remove-tag.ts";

export {
	defineSuggestionType,
	type FormatContext,
	type ResolveIds,
	type SuggestionTransaction,
	type SuggestionTypeDefinition,
	type ToastMessages,
} from "./definition.ts";

import type { FormatContext, SuggestionTypeDefinition } from "./definition.ts";

/** Registry of all suggestion types */
export const suggestionTypes = {
	add_tag: addTag,
	remove_tag: removeTag,
	create_ecosystem: createEcosystem,
	add_ecosystem_package: addEcosystemPackage,
	add_ecosystem_tag: addEcosystemTag,
	remove_ecosystem_tag: removeEcosystemTag,
} as const;

export type SuggestionTypeKey = keyof typeof suggestionTypes;

/** List of all valid suggestion type keys (for Zod enum) */
export const suggestionTypeKeys = Object.keys(suggestionTypes) as [
	SuggestionTypeKey,
	...SuggestionTypeKey[],
];

/** Get a suggestion type definition by key */
export function getSuggestionType(
	type: string,
): SuggestionTypeDefinition<unknown> | undefined {
	return suggestionTypes[type as SuggestionTypeKey] as
		| SuggestionTypeDefinition<unknown>
		| undefined;
}

/** Get the label for a suggestion type */
export function getSuggestionTypeLabel(type: string): string {
	return getSuggestionType(type)?.label ?? type.replace(/_/g, " ");
}

/** Check if a string is a valid suggestion type */
export function isValidSuggestionType(type: string): type is SuggestionTypeKey {
	return type in suggestionTypes;
}

/**
 * Get schema for a specific version.
 * Falls back to current version if requested version doesn't exist.
 */
export function getSchema(type: string, version: number) {
	const typeDef = getSuggestionType(type);
	if (!typeDef) return undefined;
	return typeDef.schemas[version] ?? typeDef.schemas[typeDef.currentVersion];
}

/**
 * Parse payload with versioned schema and format description.
 * Returns fallback string if payload is invalid.
 */
export function formatDescription(
	type: string,
	payload: unknown,
	version: number,
	ctx: FormatContext,
): string {
	const typeDef = getSuggestionType(type);
	if (!typeDef) return type.replace(/_/g, " ");
	const schema = getSchema(type, version);
	if (!schema) return typeDef.label;
	const parsed = schema.safeParse(payload);
	if (!parsed.success) return typeDef.label;
	return typeDef.formatDescription(parsed.data, ctx);
}

/**
 * Parse payload with versioned schema and format action.
 * Returns fallback string if payload is invalid.
 */
export function formatAction(
	type: string,
	payload: unknown,
	version: number,
	ctx: FormatContext,
): string {
	const typeDef = getSuggestionType(type);
	if (!typeDef) return type.replace(/_/g, " ");
	const schema = getSchema(type, version);
	if (!schema) return typeDef.label;
	const parsed = schema.safeParse(payload);
	if (!parsed.success) return typeDef.label;
	return typeDef.formatAction(parsed.data, ctx);
}

/** Get toast messages for a suggestion type */
export function getSuggestionToastMessages(type: string): {
	applied: string;
	pending: string;
} {
	const typeDef = getSuggestionType(type);
	return (
		typeDef?.toastMessages ?? {
			applied: "Change has been applied.",
			pending: "Your suggestion is now pending review.",
		}
	);
}

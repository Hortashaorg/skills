/**
 * Versioned payload schemas for suggestion types.
 *
 * Schema evolution: Add new version when payload structure changes.
 * Old suggestions remain valid with their original version.
 */

import { z } from "@package/common";
import type { SuggestionType } from "../db/types.ts";

export const suggestionPayloads = {
	add_tag: {
		1: z.object({ tagId: z.string() }),
	},
	create_ecosystem: {
		1: z.object({
			name: z.string(),
			slug: z.string(),
			description: z.string().optional(),
			website: z.string().optional(),
		}),
	},
	add_ecosystem_package: {
		1: z.object({ packageId: z.string() }),
	},
} as const;

/** Inferred payload types per suggestion type (latest version) */
export type AddTagPayload = z.infer<(typeof suggestionPayloads)["add_tag"][1]>;
export type CreateEcosystemPayload = z.infer<
	(typeof suggestionPayloads)["create_ecosystem"][1]
>;
export type AddEcosystemPackagePayload = z.infer<
	(typeof suggestionPayloads)["add_ecosystem_package"][1]
>;

/** Current version per type (used when creating new suggestions) */
export const currentPayloadVersion: Record<SuggestionType, number> = {
	add_tag: 1,
	create_ecosystem: 1,
	add_ecosystem_package: 1,
};

/** Get schema for a type+version (for validation and parsing) */
export function getPayloadSchema(
	type: SuggestionType,
	version: number,
): z.ZodTypeAny | undefined {
	const typeSchemas = suggestionPayloads[type];
	return typeSchemas?.[version as keyof typeof typeSchemas];
}

/** Parse and validate payload against schema */
export function parsePayload(
	type: SuggestionType,
	version: number,
	payload: unknown,
): unknown {
	const schema = getPayloadSchema(type, version);
	if (!schema) return null;
	const result = schema.safeParse(payload);
	return result.success ? result.data : null;
}

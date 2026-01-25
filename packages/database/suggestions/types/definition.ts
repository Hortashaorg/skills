/**
 * Suggestion type definition.
 *
 * Each type defines: versioned schemas, display formatting, and resolution logic.
 * Parsing happens once at the boundary - methods receive typed payloads.
 */

import type { z } from "@package/common";
import type { Transaction } from "@rocicorp/zero";
import type { Schema } from "../../zero-schema.gen.ts";

export type SuggestionTransaction = Transaction<Schema>;

/** Context for formatting - lookup maps for resolving IDs to names */
export interface FormatContext {
	tags?: Map<string, { name: string }>;
	packages?: Map<string, { name: string }>;
	ecosystems?: Map<string, { name: string }>;
}

/** IDs passed to resolve */
export interface ResolveIds {
	packageId: string | null;
	ecosystemId: string | null;
}

/** Context for validation */
export interface ValidateContext {
	tx: SuggestionTransaction;
	userId: string;
}

export interface ToastMessages {
	applied: string;
	pending: string;
}

/**
 * Suggestion type definition.
 * TPayload is the parsed payload type - methods receive already-validated data.
 */
export interface SuggestionTypeDefinition<TPayload> {
	type: string;
	label: string;

	/** Versioned schemas - key is version number */
	schemas: Record<number, z.ZodType<TPayload>>;

	/** Current version for new suggestions */
	currentVersion: number;

	/** Toast messages for frontend feedback */
	toastMessages: ToastMessages;

	/** Format short description (e.g., "TypeScript") */
	formatDescription: (payload: TPayload, ctx: FormatContext) => string;

	/** Format full action (e.g., 'Add tag "TypeScript"') */
	formatAction: (payload: TPayload, ctx: FormatContext) => string;

	/** Apply the suggestion when approved */
	resolve: (
		tx: SuggestionTransaction,
		payload: TPayload,
		ids: ResolveIds,
	) => Promise<void>;

	/**
	 * Validate before creating suggestion (optional).
	 * Check entity existence, duplicates, business rules.
	 * Throw Error with user-friendly message if invalid.
	 */
	validate?: (
		ctx: ValidateContext,
		payload: TPayload,
		ids: ResolveIds,
	) => Promise<void>;
}

/** Helper to create a typed suggestion definition */
export function defineSuggestionType<TPayload>(
	definition: SuggestionTypeDefinition<TPayload>,
): SuggestionTypeDefinition<TPayload> {
	return definition;
}

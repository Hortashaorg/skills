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
	packages?: Map<string, { name: string; registry: string }>;
	ecosystems?: Map<string, { name: string; slug: string }>;
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

/** Structured display data returned by formatDisplay */
export interface SuggestionDisplay {
	/** Full action text, e.g. 'Add tag "Frontend"' */
	action: string;
	/** The verb/label portion of the action, e.g. "Add package" (set by resolution layer) */
	actionLabel?: string;
	/** Short description for compact views, e.g. "Frontend" */
	description: string;
	/** Optional target entity this suggestion acts upon (e.g. the ecosystem it applies to) */
	target?: {
		/** Display label, e.g. "react" or "Web Frameworks" */
		label: string;
		/** URL path, e.g. "/package/npm/react" */
		href: string;
		/** Optional sublabel, e.g. "npm" */
		sublabel?: string;
	};
	/** Optional linkable entity referenced in the action text (e.g. the package being added) */
	actionEntity?: {
		label: string;
		href: string;
	};
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

	/** What kind of entity this suggestion targets: 'package', 'ecosystem', or 'none' */
	targetEntity: "package" | "ecosystem" | "none";

	/**
	 * Display formatting with resolved context.
	 * Returns action + description. The target link is attached by the resolution layer.
	 */
	formatDisplay: (payload: TPayload, ctx: FormatContext) => SuggestionDisplay;

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

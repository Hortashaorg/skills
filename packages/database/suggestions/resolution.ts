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
			ecosystems: {
				insert: (data: {
					id: string;
					name: string;
					slug: string;
					description: string | null;
					website: string | null;
					upvoteCount: number;
					createdAt: number;
					updatedAt: number;
				}) => Promise<void>;
			};
			ecosystemPackages: {
				insert: (data: {
					id: string;
					ecosystemId: string;
					packageId: string;
					createdAt: number;
				}) => Promise<void>;
			};
		};
	};
	suggestion: {
		id: string;
		packageId: string | null;
		ecosystemId: string | null;
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
		if (!suggestion.packageId) {
			throw new Error("add_tag requires packageId");
		}

		const record = newRecord();
		await tx.mutate.packageTags.insert({
			id: record.id,
			packageId: suggestion.packageId,
			tagId: payload.tagId,
			createdAt: record.now,
		});
	},

	create_ecosystem: async ({ tx, suggestion }) => {
		const payload = parsePayload(
			"create_ecosystem",
			suggestion.version,
			suggestion.payload,
		) as { name: string; slug: string; description?: string; website?: string } | null;
		if (!payload) {
			throw new Error("Invalid create_ecosystem payload");
		}

		const record = newRecord();
		await tx.mutate.ecosystems.insert({
			id: record.id,
			name: payload.name,
			slug: payload.slug,
			description: payload.description ?? null,
			website: payload.website ?? null,
			upvoteCount: 0,
			createdAt: record.now,
			updatedAt: record.now,
		});
	},

	add_ecosystem_package: async ({ tx, suggestion }) => {
		const payload = parsePayload(
			"add_ecosystem_package",
			suggestion.version,
			suggestion.payload,
		) as { packageId: string } | null;
		if (!payload) {
			throw new Error("Invalid add_ecosystem_package payload");
		}
		if (!suggestion.ecosystemId) {
			throw new Error("add_ecosystem_package requires ecosystemId");
		}

		const record = newRecord();
		await tx.mutate.ecosystemPackages.insert({
			id: record.id,
			ecosystemId: suggestion.ecosystemId,
			packageId: payload.packageId,
			createdAt: record.now,
		});
	},
};

/**
 * Execute resolution handler for a suggestion type.
 * Throws if no handler exists for the suggestion type.
 */
export async function resolveApprovedSuggestion(
	ctx: ResolutionContext,
): Promise<void> {
	const handler = resolutionHandlers[ctx.suggestion.type as SuggestionType];
	if (!handler) {
		throw new Error(
			`No resolution handler for suggestion type: ${ctx.suggestion.type}`,
		);
	}
	await handler(ctx);
}

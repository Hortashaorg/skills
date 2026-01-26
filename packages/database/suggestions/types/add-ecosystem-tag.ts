import { z } from "@package/common";
import { newRecord } from "../../mutators/helpers.ts";
import { zql } from "../../zero-schema.gen.ts";
import { defineSuggestionType } from "./definition.ts";

const schema = z.object({ tagId: z.string() });

export const addEcosystemTag = defineSuggestionType({
	type: "add_ecosystem_tag",
	label: "Add tag",
	schemas: { 1: schema },
	currentVersion: 1,
	toastMessages: {
		applied: "Tag has been applied.",
		pending: "Your tag suggestion is now pending review.",
	},

	targetEntity: "ecosystem",

	formatDisplay: (payload, ctx) => {
		const tagName = ctx.tags?.get(payload.tagId)?.name ?? "Unknown tag";
		return {
			action: `Add tag "${tagName}"`,
			description: tagName,
		};
	},

	resolve: async (tx, payload, ids) => {
		if (!ids.ecosystemId)
			throw new Error("add_ecosystem_tag requires ecosystemId");
		const record = newRecord();
		await tx.mutate.ecosystemTags.insert({
			id: record.id,
			ecosystemId: ids.ecosystemId,
			tagId: payload.tagId,
			createdAt: record.now,
		});
	},

	validate: async ({ tx }, payload, ids) => {
		if (!ids.ecosystemId)
			throw new Error("add_ecosystem_tag requires ecosystemId");

		// Check ecosystem exists
		const ecosystem = await tx.run(
			zql.ecosystems.where("id", ids.ecosystemId).one(),
		);
		if (!ecosystem) throw new Error("Ecosystem not found");

		// Check tag exists
		const tag = await tx.run(zql.tags.where("id", payload.tagId).one());
		if (!tag) throw new Error("Tag not found");

		// Check tag not already on ecosystem
		const existing = await tx.run(
			zql.ecosystemTags
				.where("ecosystemId", ids.ecosystemId)
				.where("tagId", payload.tagId)
				.one(),
		);
		if (existing) throw new Error("Tag is already on this ecosystem");

		// Check no duplicate pending suggestion
		const pendingSuggestions = await tx.run(
			zql.suggestions
				.where("ecosystemId", ids.ecosystemId)
				.where("type", "add_ecosystem_tag")
				.where("status", "pending"),
		);
		const hasDuplicate = pendingSuggestions.some(
			(s) => (s.payload as { tagId: string }).tagId === payload.tagId,
		);
		if (hasDuplicate) {
			throw new Error("A suggestion to add this tag is already pending");
		}
	},
});

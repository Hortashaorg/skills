import { z } from "@package/common";
import { zql } from "../../zero-schema.gen.ts";
import { defineSuggestionType } from "./definition.ts";

const schema = z.object({ tagId: z.string() });

export const removeTag = defineSuggestionType({
	type: "remove_tag",
	label: "Remove tag",
	schemas: { 1: schema },
	currentVersion: 1,
	toastMessages: {
		applied: "Tag has been removed.",
		pending: "Your tag removal suggestion is now pending review.",
	},

	targetEntity: "package",

	formatDisplay: (payload, ctx) => {
		const tagName = ctx.tags?.get(payload.tagId)?.name ?? "Unknown tag";
		return {
			action: `Remove tag "${tagName}"`,
			description: tagName,
		};
	},

	resolve: async (tx, payload, ids) => {
		if (!ids.packageId) throw new Error("remove_tag requires packageId");
		const existing = (await tx.run(
			zql.packageTags
				.where("packageId", ids.packageId)
				.where("tagId", payload.tagId)
				.one(),
		)) as { id: string } | undefined;
		if (existing) {
			await tx.mutate.packageTags.delete({ id: existing.id });
		}
	},

	validate: async ({ tx }, payload, ids) => {
		if (!ids.packageId) throw new Error("remove_tag requires packageId");

		// Check tag exists
		const tag = await tx.run(zql.tags.where("id", payload.tagId).one());
		if (!tag) throw new Error("Tag not found");

		// Check tag is on package
		const existing = await tx.run(
			zql.packageTags
				.where("packageId", ids.packageId)
				.where("tagId", payload.tagId)
				.one(),
		);
		if (!existing) throw new Error("Tag is not on this package");

		// Check no duplicate pending suggestion
		const pendingSuggestions = await tx.run(
			zql.suggestions
				.where("packageId", ids.packageId)
				.where("type", "remove_tag")
				.where("status", "pending"),
		);
		const hasDuplicate = pendingSuggestions.some(
			(s) => (s.payload as { tagId: string }).tagId === payload.tagId,
		);
		if (hasDuplicate) {
			throw new Error("A suggestion to remove this tag is already pending");
		}
	},
});

import { z } from "@package/common";
import { zql } from "../../zero-schema.gen.ts";
import { defineSuggestionType } from "./definition.ts";

const schema = z.object({ tagId: z.string() });

export const removeEcosystemTag = defineSuggestionType({
	type: "remove_ecosystem_tag",
	label: "Remove tag",
	schemas: { 1: schema },
	currentVersion: 1,

	formatDescription: (payload, ctx) =>
		ctx.tags?.get(payload.tagId)?.name ?? "Unknown tag",

	formatAction: (payload, ctx) => {
		const name = ctx.tags?.get(payload.tagId)?.name ?? "Unknown tag";
		return `Remove tag "${name}"`;
	},

	resolve: async (tx, payload, ids) => {
		if (!ids.ecosystemId)
			throw new Error("remove_ecosystem_tag requires ecosystemId");
		const existing = (await tx.run(
			zql.ecosystemTags
				.where("ecosystemId", ids.ecosystemId)
				.where("tagId", payload.tagId)
				.one(),
		)) as { id: string } | undefined;
		if (existing) {
			await tx.mutate.ecosystemTags.delete({ id: existing.id });
		}
	},

	validate: async ({ tx }, payload, ids) => {
		if (!ids.ecosystemId)
			throw new Error("remove_ecosystem_tag requires ecosystemId");

		// Check ecosystem exists
		const ecosystem = await tx.run(
			zql.ecosystems.where("id", ids.ecosystemId).one(),
		);
		if (!ecosystem) throw new Error("Ecosystem not found");

		// Check tag exists
		const tag = await tx.run(zql.tags.where("id", payload.tagId).one());
		if (!tag) throw new Error("Tag not found");

		// Check tag is on ecosystem
		const existing = await tx.run(
			zql.ecosystemTags
				.where("ecosystemId", ids.ecosystemId)
				.where("tagId", payload.tagId)
				.one(),
		);
		if (!existing) throw new Error("Tag is not on this ecosystem");

		// Check no duplicate pending suggestion
		const pending = await tx.run(
			zql.suggestions
				.where("ecosystemId", ids.ecosystemId)
				.where("type", "remove_ecosystem_tag")
				.where("status", "pending")
				.one(),
		);
		if (pending) {
			const pendingPayload = pending.payload as { tagId: string };
			if (pendingPayload.tagId === payload.tagId) {
				throw new Error("A suggestion to remove this tag is already pending");
			}
		}
	},
});

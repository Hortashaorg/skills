import { z } from "@package/common";
import { newRecord } from "../../mutators/helpers.ts";
import { zql } from "../../zero-schema.gen.ts";
import { defineSuggestionType } from "./definition.ts";

const schema = z.object({ tagId: z.string() });

export const addTag = defineSuggestionType({
	type: "add_tag",
	label: "Add tag",
	schemas: { 1: schema },
	currentVersion: 1,
	toastMessages: {
		applied: "Tag has been applied.",
		pending: "Your tag suggestion is now pending review.",
	},

	formatDescription: (payload, ctx) =>
		ctx.tags?.get(payload.tagId)?.name ?? "Unknown tag",

	formatAction: (payload, ctx) => {
		const name = ctx.tags?.get(payload.tagId)?.name ?? "Unknown tag";
		return `Add tag "${name}"`;
	},

	resolve: async (tx, payload, ids) => {
		if (!ids.packageId) throw new Error("add_tag requires packageId");
		const record = newRecord();
		await tx.mutate.packageTags.insert({
			id: record.id,
			packageId: ids.packageId,
			tagId: payload.tagId,
			createdAt: record.now,
		});
	},

	validate: async ({ tx }, payload, ids) => {
		if (!ids.packageId) throw new Error("add_tag requires packageId");

		// Check tag exists
		const tag = await tx.run(zql.tags.where("id", payload.tagId).one());
		if (!tag) throw new Error("Tag not found");

		// Check tag not already on package
		const existing = await tx.run(
			zql.packageTags
				.where("packageId", ids.packageId)
				.where("tagId", payload.tagId)
				.one(),
		);
		if (existing) throw new Error("Tag is already applied to this package");

		// Check no duplicate pending suggestion
		const pending = await tx.run(
			zql.suggestions
				.where("packageId", ids.packageId)
				.where("type", "add_tag")
				.where("status", "pending")
				.one(),
		);
		if (pending) {
			const pendingPayload = pending.payload as { tagId: string };
			if (pendingPayload.tagId === payload.tagId) {
				throw new Error("A suggestion to add this tag is already pending");
			}
		}
	},
});

import { z } from "@package/common";
import { now } from "../../mutators/helpers.ts";
import { zql } from "../../zero-schema.gen.ts";
import { defineSuggestionType } from "./definition.ts";

const schema = z.object({ description: z.string().min(1).max(2000) });

export const editEcosystemDescription = defineSuggestionType({
	type: "edit_ecosystem_description",
	label: "Edit description",
	schemas: { 1: schema },
	currentVersion: 1,
	toastMessages: {
		applied: "Description has been updated.",
		pending: "Your description edit is now pending review.",
	},

	targetEntity: "ecosystem",

	formatDisplay: (payload) => {
		const preview =
			payload.description.length > 80
				? `${payload.description.slice(0, 80)}...`
				: payload.description;
		return {
			action: `Change description to "${preview}"`,
			description:
				payload.description.length > 60
					? `${payload.description.slice(0, 60)}...`
					: payload.description,
		};
	},

	resolve: async (tx, payload, ids) => {
		if (!ids.ecosystemId)
			throw new Error("edit_ecosystem_description requires ecosystemId");
		await tx.mutate.ecosystems.update({
			id: ids.ecosystemId,
			description: payload.description,
			updatedAt: now(),
		});
	},

	validate: async ({ tx }, payload, ids) => {
		if (!ids.ecosystemId)
			throw new Error("edit_ecosystem_description requires ecosystemId");

		const ecosystem = await tx.run(
			zql.ecosystems.where("id", ids.ecosystemId).one(),
		);
		if (!ecosystem) throw new Error("Ecosystem not found");

		if (ecosystem.description === payload.description) {
			throw new Error("Description is the same as current");
		}

		const pendingSuggestions = await tx.run(
			zql.suggestions
				.where("ecosystemId", ids.ecosystemId)
				.where("type", "edit_ecosystem_description")
				.where("status", "pending"),
		);
		if (pendingSuggestions.length > 0) {
			throw new Error("A description edit suggestion is already pending");
		}
	},
});

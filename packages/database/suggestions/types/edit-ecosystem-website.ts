import { z } from "@package/common";
import { now } from "../../mutators/helpers.ts";
import { zql } from "../../zero-schema.gen.ts";
import { defineSuggestionType } from "./definition.ts";

const schema = z.object({
	website: z.string().url().max(2000).nullable(),
});

export const editEcosystemWebsite = defineSuggestionType({
	type: "edit_ecosystem_website",
	label: "Edit website",
	schemas: { 1: schema },
	currentVersion: 1,
	toastMessages: {
		applied: "Website has been updated.",
		pending: "Your website edit is now pending review.",
	},

	targetEntity: "ecosystem",

	formatDisplay: (payload) => {
		if (!payload.website) {
			return {
				action: "Remove website URL",
				description: "Remove website",
			};
		}
		const preview =
			payload.website.length > 80
				? `${payload.website.slice(0, 80)}...`
				: payload.website;
		return {
			action: `Change website to "${preview}"`,
			description:
				payload.website.length > 60
					? `${payload.website.slice(0, 60)}...`
					: payload.website,
		};
	},

	resolve: async (tx, payload, ids) => {
		if (!ids.ecosystemId)
			throw new Error("edit_ecosystem_website requires ecosystemId");
		await tx.mutate.ecosystems.update({
			id: ids.ecosystemId,
			website: payload.website,
			updatedAt: now(),
		});
	},

	validate: async ({ tx }, payload, ids) => {
		if (!ids.ecosystemId)
			throw new Error("edit_ecosystem_website requires ecosystemId");

		const ecosystem = await tx.run(
			zql.ecosystems.where("id", ids.ecosystemId).one(),
		);
		if (!ecosystem) throw new Error("Ecosystem not found");

		if (ecosystem.website === payload.website) {
			throw new Error("Website is the same as current");
		}

		const pendingSuggestions = await tx.run(
			zql.suggestions
				.where("ecosystemId", ids.ecosystemId)
				.where("type", "edit_ecosystem_website")
				.where("status", "pending"),
		);
		if (pendingSuggestions.length > 0) {
			throw new Error("A website edit suggestion is already pending");
		}
	},
});

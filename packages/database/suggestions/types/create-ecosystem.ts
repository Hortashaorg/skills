import { z } from "@package/common";
import { newRecord } from "../../mutators/helpers.ts";
import { zql } from "../../zero-schema.gen.ts";
import { defineSuggestionType } from "./definition.ts";

const slugify = (text: string): string =>
	text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");

const schema = z
	.object({
		name: z.string(),
		description: z.string().optional(),
		website: z.string().optional(),
	})
	.transform((data) => ({ ...data, slug: slugify(data.name) }));

export const createEcosystem = defineSuggestionType({
	type: "create_ecosystem",
	label: "Create ecosystem",
	schemas: { 1: schema },
	currentVersion: 1,
	toastMessages: {
		applied: "Ecosystem has been created.",
		pending: "Your ecosystem suggestion is now pending review.",
	},

	targetEntity: "none",

	formatDisplay: (payload) => ({
		action: `Create ecosystem "${payload.name}"`,
		description: payload.name,
	}),

	resolve: async (tx, payload) => {
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

	validate: async ({ tx }, payload) => {
		// Check no existing ecosystem with same slug
		const existing = await tx.run(
			zql.ecosystems.where("slug", payload.slug).one(),
		);
		if (existing) throw new Error("An ecosystem with this name already exists");

		// Check no duplicate pending suggestion with same slug
		const pending = await tx.run(
			zql.suggestions
				.where("type", "create_ecosystem")
				.where("status", "pending"),
		);
		for (const p of pending) {
			const pendingPayload = p.payload as { slug: string };
			if (pendingPayload.slug === payload.slug) {
				throw new Error(
					"A suggestion to create this ecosystem is already pending",
				);
			}
		}
	},
});

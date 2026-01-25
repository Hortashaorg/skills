import { z } from "@package/common";
import { newRecord } from "../../mutators/helpers.ts";
import { zql } from "../../zero-schema.gen.ts";
import { defineSuggestionType } from "./definition.ts";

const schema = z.object({ packageId: z.string() });

export const addEcosystemPackage = defineSuggestionType({
	type: "add_ecosystem_package",
	label: "Add package",
	schemas: { 1: schema },
	currentVersion: 1,
	toastMessages: {
		applied: "Package has been added.",
		pending: "Your package suggestion is now pending review.",
	},

	formatDescription: (payload, ctx) =>
		ctx.packages?.get(payload.packageId)?.name ?? "Unknown package",

	formatAction: (payload, ctx) => {
		const name =
			ctx.packages?.get(payload.packageId)?.name ?? "Unknown package";
		return `Add package "${name}"`;
	},

	resolve: async (tx, payload, ids) => {
		if (!ids.ecosystemId)
			throw new Error("add_ecosystem_package requires ecosystemId");
		const record = newRecord();
		await tx.mutate.ecosystemPackages.insert({
			id: record.id,
			ecosystemId: ids.ecosystemId,
			packageId: payload.packageId,
			createdAt: record.now,
		});
	},

	validate: async ({ tx }, payload, ids) => {
		if (!ids.ecosystemId)
			throw new Error("add_ecosystem_package requires ecosystemId");

		// Check ecosystem exists
		const ecosystem = await tx.run(
			zql.ecosystems.where("id", ids.ecosystemId).one(),
		);
		if (!ecosystem) throw new Error("Ecosystem not found");

		// Check package exists
		const pkg = await tx.run(zql.packages.where("id", payload.packageId).one());
		if (!pkg) throw new Error("Package not found");

		// Check package not already in ecosystem
		const existing = await tx.run(
			zql.ecosystemPackages
				.where("ecosystemId", ids.ecosystemId)
				.where("packageId", payload.packageId)
				.one(),
		);
		if (existing) throw new Error("Package is already in this ecosystem");

		// Check no duplicate pending suggestion
		const pendingSuggestions = await tx.run(
			zql.suggestions
				.where("ecosystemId", ids.ecosystemId)
				.where("type", "add_ecosystem_package")
				.where("status", "pending"),
		);
		const hasDuplicate = pendingSuggestions.some(
			(s) =>
				(s.payload as { packageId: string }).packageId === payload.packageId,
		);
		if (hasDuplicate) {
			throw new Error("A suggestion to add this package is already pending");
		}
	},
});

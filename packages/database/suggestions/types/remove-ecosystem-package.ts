import { z } from "@package/common";
import { now } from "../../mutators/helpers.ts";
import { zql } from "../../zero-schema.gen.ts";
import { defineSuggestionType } from "./definition.ts";

const schema = z.object({ packageId: z.string() });

export const removeEcosystemPackage = defineSuggestionType({
	type: "remove_ecosystem_package",
	label: "Remove package",
	schemas: { 1: schema },
	currentVersion: 1,
	toastMessages: {
		applied: "Package has been removed.",
		pending: "Your package removal suggestion is now pending review.",
	},

	targetEntity: "ecosystem",

	formatDisplay: (payload, ctx) => {
		const pkgName =
			ctx.packages?.get(payload.packageId)?.name ?? "Unknown package";
		return {
			action: `Remove package "${pkgName}"`,
			description: pkgName,
		};
	},

	resolve: async (tx, payload, ids) => {
		if (!ids.ecosystemId)
			throw new Error("remove_ecosystem_package requires ecosystemId");
		const existing = (await tx.run(
			zql.ecosystemPackages
				.where("ecosystemId", ids.ecosystemId)
				.where("packageId", payload.packageId)
				.one(),
		)) as { id: string } | undefined;
		if (existing) {
			await tx.mutate.ecosystemPackages.delete({ id: existing.id });
			await tx.mutate.ecosystems.update({
				id: ids.ecosystemId,
				updatedAt: now(),
			});
		}
	},

	validate: async ({ tx }, payload, ids) => {
		if (!ids.ecosystemId)
			throw new Error("remove_ecosystem_package requires ecosystemId");

		const ecosystem = await tx.run(
			zql.ecosystems.where("id", ids.ecosystemId).one(),
		);
		if (!ecosystem) throw new Error("Ecosystem not found");

		const existing = await tx.run(
			zql.ecosystemPackages
				.where("ecosystemId", ids.ecosystemId)
				.where("packageId", payload.packageId)
				.one(),
		);
		if (!existing) throw new Error("Package is not in this ecosystem");

		const pendingSuggestions = await tx.run(
			zql.suggestions
				.where("ecosystemId", ids.ecosystemId)
				.where("type", "remove_ecosystem_package")
				.where("status", "pending"),
		);
		const hasDuplicate = pendingSuggestions.some(
			(s) =>
				(s.payload as { packageId: string }).packageId === payload.packageId,
		);
		if (hasDuplicate) {
			throw new Error("A suggestion to remove this package is already pending");
		}
	},
});

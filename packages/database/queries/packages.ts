import { defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import { zql } from "../zero-schema.gen.ts";

export const list = defineQuery(() => {
	return zql.packages;
});

export const byId = defineQuery(z.object({ id: z.string() }), ({ args }) => {
	return zql.packages.where("id", args.id);
});

export const byName = defineQuery(
	z.object({
		name: z.string(),
		registry: z.enum(["npm", "jsr", "brew", "apt"]),
	}),
	({ args }) => {
		// TODO: Zero doesn't support multiple where clauses
		// For now, filter by name only, handle registry client-side
		return zql.packages.where("name", args.name);
	},
);

export const search = defineQuery(z.object({ query: z.string() }), () => {
	// Note: Zero doesn't support LIKE queries directly
	// For MVP, return all packages and filter client-side
	// Or use a full-text search solution later
	return zql.packages;
});

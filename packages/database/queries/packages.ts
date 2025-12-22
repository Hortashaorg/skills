import { defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import { enums } from "../db/types.ts";
import { zql } from "../zero-schema.gen.ts";

export const list = defineQuery(() => {
	return zql.packages.related("upvotes");
});

export const byId = defineQuery(z.object({ id: z.string() }), ({ args }) => {
	return zql.packages.where("id", args.id);
});

export const byName = defineQuery(
	z.object({
		name: z.string(),
		registry: z.enum(enums.registry),
	}),
	({ args }) => {
		return zql.packages
			.where("name", args.name)
			.where("registry", args.registry);
	},
);

export const search = defineQuery(z.object({ query: z.string() }), () => {
	// Zero uses exact matching only - no LIKE/pattern queries
	// Filter client-side with .includes() or add full-text search later
	return zql.packages;
});

export const byNameWithVersions = defineQuery(
	z.object({
		name: z.string(),
		registry: z.enum(enums.registry),
	}),
	({ args }) => {
		return zql.packages
			.where("name", args.name)
			.where("registry", args.registry)
			.related("versions", (q) => q.orderBy("publishedAt", "desc"))
			.related("upvotes");
	},
);

export const byIdWithVersions = defineQuery(
	z.object({ id: z.string() }),
	({ args }) => {
		return zql.packages
			.where("id", args.id)
			.related("versions", (q) => q.orderBy("publishedAt", "desc"));
	},
);

import { defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import { zql } from "../zero-schema.gen.ts";

export const list = defineQuery(() => {
	return zql.tags;
});

export const byId = defineQuery(z.object({ id: z.string() }), ({ args }) => {
	return zql.tags.where("id", args.id).one();
});

export const bySlug = defineQuery(
	z.object({ slug: z.string() }),
	({ args }) => {
		return zql.tags.where("slug", args.slug).one();
	},
);

export const withPackages = defineQuery(() => {
	return zql.tags;
});

// Admin-only query with package counts
export const all = defineQuery(({ ctx }) => {
	if (!ctx.roles.includes("admin")) {
		throw new Error("Unauthorized: admin role required");
	}
	return zql.tags.related("packageTags");
});

// Public query with package counts for tag filter
export const listWithCounts = defineQuery(() => {
	return zql.tags.related("packageTags");
});

import { z } from "@package/common";
import { defineQuery } from "@rocicorp/zero";
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

// Public query with ecosystem counts for ecosystem tag filter
export const listWithEcosystemCounts = defineQuery(() => {
	return zql.tags.related("ecosystemTags");
});

// Search tags by name
export const search = defineQuery(
	z.object({
		query: z.string().optional(),
		limit: z.number().default(10),
	}),
	({ args }) => {
		let q = zql.tags;

		if (args.query?.trim()) {
			q = q.where("name", "ILIKE", `%${args.query.trim()}%`);
		}

		return q.orderBy("name", "asc").limit(args.limit);
	},
);

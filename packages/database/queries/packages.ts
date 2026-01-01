import { defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import { enums } from "../db/types.ts";
import { zql } from "../zero-schema.gen.ts";

export const list = defineQuery(() => {
	return zql.packages
		.where("status", "active")
		.related("upvotes")
		.related("packageTags", (pt) => pt.related("tag"));
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

export const byNameWithChannels = defineQuery(
	z.object({
		name: z.string(),
		registry: z.enum(enums.registry),
	}),
	({ args }) => {
		return zql.packages
			.where("name", args.name)
			.where("registry", args.registry)
			.related("releaseChannels")
			.related("upvotes");
	},
);

export const byIdWithChannels = defineQuery(
	z.object({ id: z.string() }),
	({ args }) => {
		return zql.packages.where("id", args.id).related("releaseChannels");
	},
);

export const byIdWithTags = defineQuery(
	z.object({ id: z.string() }),
	({ args }) => {
		return zql.packages.where("id", args.id).related("packageTags").one();
	},
);

// Recently updated packages for homepage default view
export const recent = defineQuery(
	z.object({ limit: z.number().default(20) }),
	({ args }) => {
		return zql.packages
			.where("status", "active")
			.orderBy("updatedAt", "desc")
			.limit(args.limit)
			.related("upvotes")
			.related("packageTags", (pt) => pt.related("tag"));
	},
);

// Failed packages for admin dashboard
export const failed = defineQuery(() => {
	return zql.packages
		.where("status", "failed")
		.orderBy("updatedAt", "desc")
		.limit(50);
});

// Search packages with filters (server-side filtering)
export const search = defineQuery(
	z.object({
		query: z.string().optional(),
		registry: z.enum(enums.registry).optional(),
		tagSlugs: z.array(z.string()).optional(),
		limit: z.number().default(100),
	}),
	({ args }) => {
		let q = zql.packages.where("status", "active");

		// Text search on name (case-insensitive)
		if (args.query?.trim()) {
			q = q.where("name", "ILIKE", `%${args.query.trim()}%`);
		}

		// Registry filter
		if (args.registry) {
			q = q.where("registry", args.registry);
		}

		// Tag filter - packages that have ANY of the specified tags
		const tagSlugs = args.tagSlugs;
		if (tagSlugs?.length) {
			q = q.whereExists("packageTags", (pt) =>
				pt.whereExists("tag", (t) => t.where("slug", "IN", tagSlugs)),
			);
		}

		return q
			.orderBy("upvoteCount", "desc")
			.orderBy("name", "asc")
			.limit(args.limit)
			.related("upvotes")
			.related("packageTags", (pt) => pt.related("tag"));
	},
);

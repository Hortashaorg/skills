import { z } from "@package/common";
import { defineQuery } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";

export const list = defineQuery(() => {
	return zql.ecosystems
		.orderBy("upvoteCount", "desc")
		.orderBy("name", "asc")
		.related("upvotes")
		.related("ecosystemPackages");
});

export const bySlug = defineQuery(
	z.object({ slug: z.string() }),
	({ args }) => {
		return zql.ecosystems
			.where("slug", args.slug)
			.related("upvotes")
			.related("ecosystemPackages", (ep) => ep.related("package"));
	},
);

export const byId = defineQuery(z.object({ id: z.string() }), ({ args }) => {
	return zql.ecosystems
		.where("id", args.id)
		.related("upvotes")
		.related("ecosystemPackages", (ep) => ep.related("package"));
});

export const search = defineQuery(
	z.object({
		query: z.string().optional(),
		limit: z.number().default(50),
	}),
	({ args }) => {
		let q = zql.ecosystems;

		if (args.query?.trim()) {
			q = q.where("name", "ILIKE", `%${args.query.trim()}%`);
		}

		return q
			.orderBy("upvoteCount", "desc")
			.orderBy("name", "asc")
			.limit(args.limit)
			.related("upvotes")
			.related("ecosystemPackages");
	},
);

export const byPackageId = defineQuery(
	z.object({ packageId: z.string() }),
	({ args }) => {
		return zql.ecosystems
			.whereExists("ecosystemPackages", (ep) =>
				ep.where("packageId", args.packageId),
			)
			.related("upvotes");
	},
);

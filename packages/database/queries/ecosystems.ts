import { z } from "@package/common";
import { defineQuery } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";

export const list = defineQuery(() => {
	return zql.ecosystems
		.orderBy("upvoteCount", "desc")
		.orderBy("name", "asc")
		.related("upvotes")
		.related("ecosystemPackages")
		.related("ecosystemTags", (et) => et.related("tag"));
});

export const bySlug = defineQuery(
	z.object({ slug: z.string() }),
	({ args }) => {
		return zql.ecosystems
			.where("slug", args.slug)
			.related("upvotes")
			.related("ecosystemPackages", (ep) =>
				ep.related("package", (pkg) =>
					pkg
						.related("packageTags", (pt) => pt.related("tag"))
						.related("upvotes"),
				),
			)
			.related("ecosystemTags", (et) => et.related("tag"));
	},
);

export const byId = defineQuery(z.object({ id: z.string() }), ({ args }) => {
	return zql.ecosystems
		.where("id", args.id)
		.related("upvotes")
		.related("ecosystemPackages", (ep) =>
			ep.related("package", (pkg) =>
				pkg
					.related("packageTags", (pt) => pt.related("tag"))
					.related("upvotes"),
			),
		)
		.related("ecosystemTags", (et) => et.related("tag"));
});

export const search = defineQuery(
	z.object({
		query: z.string().optional(),
		tagSlugs: z.array(z.string()).optional(),
		limit: z.number().default(50),
	}),
	({ args }) => {
		let q = zql.ecosystems;

		if (args.query?.trim()) {
			q = q.where("name", "ILIKE", `%${args.query.trim()}%`);
		}

		const tagSlugs = args.tagSlugs;
		if (tagSlugs?.length) {
			q = q.whereExists("ecosystemTags", (et) =>
				et.whereExists("tag", (t) => t.where("slug", "IN", tagSlugs)),
			);
		}

		return q
			.orderBy("upvoteCount", "desc")
			.orderBy("name", "asc")
			.limit(args.limit)
			.related("upvotes")
			.related("ecosystemPackages")
			.related("ecosystemTags", (et) => et.related("tag"));
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

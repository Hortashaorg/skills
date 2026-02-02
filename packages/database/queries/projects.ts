import { z } from "@package/common";
import { defineQuery } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";

export const mine = defineQuery(
	z.object({
		query: z.string().optional(),
		limit: z.number().default(50),
	}),
	({ ctx, args }) => {
		let q = zql.projects.where("accountId", ctx.userID);

		if (args.query?.trim()) {
			q = q.where("name", "ILIKE", `%${args.query.trim()}%`);
		}

		return q
			.orderBy("updatedAt", "desc")
			.limit(args.limit)
			.related("projectPackages", (pp) => pp.related("package"))
			.related("projectEcosystems", (pe) => pe.related("ecosystem"));
	},
);

export const byId = defineQuery(z.object({ id: z.string() }), ({ args }) => {
	return zql.projects
		.where("id", args.id)
		.related("projectPackages", (pp) =>
			pp.related("package", (pkg) =>
				pkg
					.related("packageTags", (pt) => pt.related("tag"))
					.related("upvotes"),
			),
		)
		.related("projectEcosystems", (pe) =>
			pe.related("ecosystem", (eco) =>
				eco
					.related("ecosystemTags", (et) => et.related("tag"))
					.related("upvotes"),
			),
		)
		.related("account")
		.one();
});

export const list = defineQuery(
	z.object({
		query: z.string().optional(),
		limit: z.number().default(50),
	}),
	({ args }) => {
		let q = zql.projects;

		if (args.query?.trim()) {
			q = q.where("name", "ILIKE", `%${args.query.trim()}%`);
		}

		return q
			.orderBy("updatedAt", "desc")
			.limit(args.limit)
			.related("account")
			.related("projectPackages");
	},
);

export const byAccountId = defineQuery(
	z.object({ accountId: z.string(), limit: z.number().default(6) }),
	({ args }) => {
		return zql.projects
			.where("accountId", args.accountId)
			.orderBy("updatedAt", "desc")
			.limit(args.limit)
			.related("projectPackages")
			.related("account");
	},
);

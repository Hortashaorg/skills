import { z } from "@package/common";
import { defineQuery } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";

export const mine = defineQuery(({ ctx }) => {
	return zql.projects
		.where("accountId", ctx.userID)
		.orderBy("updatedAt", "desc")
		.related("projectPackages", (pp) => pp.related("package"));
});

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
		.related("account")
		.one();
});

export const list = defineQuery(() => {
	return zql.projects
		.orderBy("updatedAt", "desc")
		.limit(50)
		.related("account")
		.related("projectPackages");
});

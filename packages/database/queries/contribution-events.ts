import { z } from "@package/common";
import { defineQuery } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";

export const forUser = defineQuery(
	z.object({ accountId: z.string(), limit: z.number().default(20) }),
	({ args }) => {
		return zql.contributionEvents
			.where("accountId", args.accountId)
			.orderBy("createdAt", "desc")
			.limit(args.limit)
			.related("suggestion", (s) => s.related("package").related("ecosystem"));
	},
);

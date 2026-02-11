import { z } from "@package/common";
import { defineQuery } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";

export const myAccount = defineQuery(({ ctx }) => {
	return zql.account.where("id", ctx.userID);
});

export const allAccounts = defineQuery(() => {
	return zql.account;
});

export const byId = defineQuery(z.object({ id: z.string() }), ({ args }) => {
	return zql.account.where("id", args.id).one();
});

export const byIds = defineQuery(
	z.object({ ids: z.array(z.string()) }),
	({ args }) => {
		return zql.account.where("id", "IN", args.ids);
	},
);

// Recently joined users for default view when no search
export const recent = defineQuery(
	z.object({ limit: z.number().default(20) }),
	({ args }) => {
		return zql.account
			.where("deletedAt", "IS", null)
			.orderBy("createdAt", "desc")
			.orderBy("id", "asc")
			.limit(args.limit)
			.related("contributionScore");
	},
);

// Exact name match (case-insensitive) - floats to top of search results
export const exactMatch = defineQuery(
	z.object({ name: z.string() }),
	({ args }) => {
		return zql.account
			.where("deletedAt", "IS", null)
			.where("name", "ILIKE", args.name)
			.related("contributionScore");
	},
);

// Search users by name, sorted by createdAt (for user directory)
export const search = defineQuery(
	z.object({
		query: z.string().optional(),
		limit: z.number().default(50),
	}),
	({ args }) => {
		let q = zql.account.where("deletedAt", "IS", null);

		if (args.query?.trim()) {
			q = q.where("name", "ILIKE", `%${args.query.trim()}%`);
		}

		return q
			.orderBy("createdAt", "desc")
			.orderBy("name", "asc")
			.limit(args.limit)
			.related("contributionScore");
	},
);

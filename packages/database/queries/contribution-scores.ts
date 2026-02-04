import { z } from "@package/common";
import { defineQuery } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";

export const leaderboardMonthly = defineQuery(
	z.object({ limit: z.number().default(50) }),
	({ args }) => {
		return zql.contributionScores
			.orderBy("monthlyScore", "desc")
			.limit(args.limit)
			.related("account");
	},
);

export const leaderboardAllTime = defineQuery(
	z.object({ limit: z.number().default(50) }),
	({ args }) => {
		return zql.contributionScores
			.orderBy("allTimeScore", "desc")
			.limit(args.limit)
			.related("account");
	},
);

export const forUser = defineQuery(
	z.object({ accountId: z.string() }),
	({ args }) => {
		return zql.contributionScores.where("accountId", args.accountId).one();
	},
);

// Search users by name, sorted by monthly score (for leaderboard with search)
export const searchByMonthlyScore = defineQuery(
	z.object({
		query: z.string().optional(),
		limit: z.number().default(50),
	}),
	({ args }) => {
		let q = zql.contributionScores;

		const trimmedQuery = args.query?.trim();
		if (trimmedQuery) {
			q = q.whereExists("account", (a) =>
				a.where("name", "ILIKE", `%${trimmedQuery}%`),
			);
		}

		return q
			.orderBy("monthlyScore", "desc")
			.orderBy("accountId", "asc")
			.limit(args.limit)
			.related("account");
	},
);

// Search users by name, sorted by all-time score (for leaderboard with search)
export const searchByAllTimeScore = defineQuery(
	z.object({
		query: z.string().optional(),
		limit: z.number().default(50),
	}),
	({ args }) => {
		let q = zql.contributionScores;

		const trimmedQuery = args.query?.trim();
		if (trimmedQuery) {
			q = q.whereExists("account", (a) =>
				a.where("name", "ILIKE", `%${trimmedQuery}%`),
			);
		}

		return q
			.orderBy("allTimeScore", "desc")
			.orderBy("accountId", "asc")
			.limit(args.limit)
			.related("account");
	},
);

// Exact name match for contribution scores (case-insensitive)
export const exactMatchByName = defineQuery(
	z.object({ name: z.string() }),
	({ args }) => {
		return zql.contributionScores
			.whereExists("account", (a) => a.where("name", "ILIKE", args.name))
			.related("account");
	},
);

import { defineQuery } from "@rocicorp/zero";
import { z } from "zod";
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

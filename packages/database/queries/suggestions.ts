import { z } from "@package/common";
import { defineQuery } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";

export const forPackage = defineQuery(
	z.object({ packageId: z.string() }),
	({ args }) => {
		return zql.suggestions
			.where("packageId", args.packageId)
			.orderBy("createdAt", "desc")
			.related("account")
			.related("votes");
	},
);

export const pendingForPackage = defineQuery(
	z.object({ packageId: z.string() }),
	({ args }) => {
		return zql.suggestions
			.where("packageId", args.packageId)
			.where("status", "pending")
			.orderBy("createdAt", "desc")
			.related("account")
			.related("votes");
	},
);

export const pending = defineQuery(() => {
	return zql.suggestions
		.where("status", "pending")
		.orderBy("createdAt", "asc")
		.related("account")
		.related("votes")
		.related("package");
});

export const pendingExcludingUser = defineQuery(
	z.object({ excludeAccountId: z.string() }),
	({ args }) => {
		return zql.suggestions
			.where("status", "pending")
			.where("accountId", "!=", args.excludeAccountId)
			.orderBy("createdAt", "asc")
			.related("account")
			.related("votes")
			.related("package");
	},
);

export const byId = defineQuery(z.object({ id: z.string() }), ({ args }) => {
	return zql.suggestions
		.where("id", args.id)
		.one()
		.related("account")
		.related("votes")
		.related("package");
});

export const pendingForEcosystem = defineQuery(
	z.object({ ecosystemId: z.string() }),
	({ args }) => {
		return zql.suggestions
			.where("ecosystemId", args.ecosystemId)
			.where("status", "pending")
			.orderBy("createdAt", "desc")
			.related("account")
			.related("votes")
			.related("package");
	},
);

export const pendingCreateEcosystem = defineQuery(() => {
	return zql.suggestions
		.where("type", "create_ecosystem")
		.where("status", "pending")
		.orderBy("createdAt", "desc")
		.related("account")
		.related("votes");
});

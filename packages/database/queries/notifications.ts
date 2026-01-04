import { defineQuery } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";

// For anon users, these return empty results since no notifications have accountId="anon"
export const mine = defineQuery(({ ctx }) =>
	zql.notifications
		.where("accountId", ctx.userID)
		.orderBy("createdAt", "desc")
		.limit(20),
);

export const unreadCount = defineQuery(({ ctx }) =>
	zql.notifications
		.where("accountId", ctx.userID)
		.where("read", false)
		.limit(20),
);

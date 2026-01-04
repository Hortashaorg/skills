import { defineQuery } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";

export const mine = defineQuery(({ ctx }) => {
	return zql.notifications
		.where("accountId", ctx.userID)
		.orderBy("createdAt", "desc");
});

export const unreadCount = defineQuery(({ ctx }) => {
	return zql.notifications
		.where("accountId", ctx.userID)
		.where("read", false);
});

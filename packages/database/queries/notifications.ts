import { defineQuery } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";

export const mine = defineQuery(({ ctx }) => {
	if (ctx.userID === "anon") {
		throw new Error("Must be logged in");
	}
	return zql.notifications
		.where("accountId", ctx.userID)
		.orderBy("createdAt", "desc")
		.limit(20);
});

export const unreadCount = defineQuery(({ ctx }) => {
	if (ctx.userID === "anon") {
		throw new Error("Must be logged in");
	}
	return zql.notifications
		.where("accountId", ctx.userID)
		.where("read", false)
		.limit(20);
});

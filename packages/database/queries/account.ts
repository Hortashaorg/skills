import { defineQuery } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";

export const myAccount = defineQuery(({ ctx }) => {
	return zql.account.where("id", ctx.userID);
});

export const allAccounts = defineQuery(() => {
	return zql.account;
});

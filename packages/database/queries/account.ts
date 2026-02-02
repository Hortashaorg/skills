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

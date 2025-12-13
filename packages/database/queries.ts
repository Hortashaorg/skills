// zero/queries.ts
import { defineQueries, defineQuery } from "@rocicorp/zero";
import { zql } from "./zero-schema.gen.ts";

const myAccount = defineQuery(({ ctx: { userID } }) => {
	return zql.account.where("id", userID);
});

export const queries = defineQueries({
	account: {
		myAccount,
	},
});

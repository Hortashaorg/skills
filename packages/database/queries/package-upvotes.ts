import { defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import { zql } from "../zero-schema.gen.ts";

export const byPackage = defineQuery(
	z.object({ packageId: z.string() }),
	({ args }) => {
		return zql.packageUpvotes.where("packageId", args.packageId);
	},
);

export const byUser = defineQuery(({ ctx }) => {
	return zql.packageUpvotes.where("accountId", ctx.userID);
});

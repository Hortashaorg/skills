import { throwError } from "@package/common";
import {
	handleMutateRequest,
	mustGetMutator,
	mutators,
} from "@package/database/server";
import type { Context } from "hono";
import { dbProvider, getUserID } from "./util.ts";

export async function handleMutate(c: Context) {
	const userID = (await getUserID(c)) ?? throwError("There is always userID");
	const ctx = { userID };
	return handleMutateRequest(
		dbProvider,
		(transact) => {
			return transact((tx, name, args) => {
				const mutator = mustGetMutator(mutators, name);
				return mutator.fn({ tx, args, ctx });
			});
		},
		c.req.raw,
	);
}

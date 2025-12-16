import { throwError } from "@package/common";
import {
	dbProvider,
	handleMutateRequest,
	mustGetMutator,
	mutators,
} from "@package/database/server";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { getUserID } from "./util.ts";

export async function handleMutate(c: Context) {
	try {
		const userID = (await getUserID(c)) ?? throwError("There is always userID");
		const ctx = { userID };
		return c.json(
			await handleMutateRequest(
				dbProvider,
				(transact) => {
					return transact((tx, name, args) => {
						const mutator = mustGetMutator(mutators, name);
						return mutator.fn({ tx, args, ctx });
					});
				},
				c.req.raw,
			),
		);
	} catch (error) {
		if (error instanceof HTTPException) {
			return c.json({ error: error.message }, error.status);
		}
		throw error;
	}
}

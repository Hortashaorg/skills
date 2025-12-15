import { throwError } from "@package/common";
import {
	handleQueryRequest,
	mustGetQuery,
	queries,
	schema,
} from "@package/database/server";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { getUserID } from "./util.ts";

export async function handleQuery(c: Context) {
	try {
		const userID = (await getUserID(c)) ?? throwError("There is always userID");
		const ctx = { userID };
		return handleQueryRequest(
			(name, args) => {
				const query = mustGetQuery(queries, name);
				return query.fn({ args, ctx });
			},
			schema,
			c.req.raw,
		);
	} catch (error) {
		if (error instanceof HTTPException) {
			return c.json({ error: error.message }, error.status);
		}
		throw error;
	}
}

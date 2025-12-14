import { throwError } from "@package/common";
import {
	handleQueryRequest,
	mustGetQuery,
	queries,
	schema,
} from "@package/database/server";
import type { Context } from "hono";
import { getUserID } from "./util.ts";

export async function handleQuery(c: Context) {
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
}

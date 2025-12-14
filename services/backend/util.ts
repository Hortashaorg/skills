import { schema, zeroPostgresJS } from "@package/database/server";
import type { Context } from "hono";
import { getSignedCookie } from "hono/cookie";
import postgres from "postgres";
import { environment } from "./environment.ts";

// Database provider for Zero using postgres.js adapter
export const dbProvider = zeroPostgresJS(
	schema,
	postgres(environment.ZERO_UPSTREAM_DB),
);

export async function getUserID(c: Context) {
	const cookie = await getSignedCookie(c, environment.AUTH_PRIVATE_KEY, "auth");
	if (!cookie) {
		return "anon";
	}
	return cookie;
}

export const sql = postgres(environment.ZERO_UPSTREAM_DB);

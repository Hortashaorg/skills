import { schema, zeroPostgresJS } from "@package/database/server";
import type { Context } from "hono";
import { verify } from "hono/jwt";
import postgres from "postgres";
import { environment } from "./environment.ts";

export const dbProvider = zeroPostgresJS(
	schema,
	postgres(environment.ZERO_UPSTREAM_DB),
);

export async function getUserID(c: Context) {
	const token = c.req.header("Authorization")?.split(" ")[1];
	if (!token) {
		return "anon";
	}
	const decoded = await verify(token, environment.AUTH_PRIVATE_KEY);
	return decoded.sub as string;
}

export const sql = postgres(environment.ZERO_UPSTREAM_DB);

import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";
import { environment } from "./environment.ts";

export async function getUserID(c: Context) {
	const token = c.req.header("Authorization")?.split(" ")[1];
	if (!token) {
		return "anon";
	}

	try {
		const decoded = await verify(token, environment.AUTH_PRIVATE_KEY);
		return decoded.sub as string;
	} catch {
		throw new HTTPException(401, { message: "Token expired or invalid" });
	}
}

import type { Context as AppContext } from "@package/database/types";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";
import { environment } from "./environment.ts";

const ANON_CONTEXT: AppContext = {
	userID: "anon",
	roles: [],
};

export async function getAuthContext(c: Context): Promise<AppContext> {
	const token = c.req.header("Authorization")?.split(" ")[1];
	if (!token) {
		return ANON_CONTEXT;
	}

	try {
		const decoded = await verify(token, environment.AUTH_PRIVATE_KEY, "HS256");
		return {
			userID: decoded.sub as string,
			roles: (decoded.roles as string[]) ?? [],
		};
	} catch {
		throw new HTTPException(401, { message: "Token expired or invalid" });
	}
}

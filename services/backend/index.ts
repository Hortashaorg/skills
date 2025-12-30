import { serve } from "@hono/node-server";
import { throwError } from "@package/common";
import type { Context } from "hono";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { decode, sign } from "hono/jwt";
import { ensureUser } from "./ensure-user.ts";
import { environment } from "./environment.ts";
import { handleMutate } from "./mutate.ts";
import { handleQuery } from "./query.ts";

const REFRESH_TOKEN_COOKIE = {
	name: "refresh_token",
	maxAge: 180 * 24 * 60 * 60, // 180 days in seconds
	httpOnly: true,
	secure: environment.NODE_ENV !== "local",
	sameSite: "lax" as const,
};

const setRefreshToken = (c: Context, token: string) => {
	setCookie(c, REFRESH_TOKEN_COOKIE.name, token, {
		maxAge: REFRESH_TOKEN_COOKIE.maxAge,
		httpOnly: REFRESH_TOKEN_COOKIE.httpOnly,
		secure: REFRESH_TOKEN_COOKIE.secure,
		sameSite: REFRESH_TOKEN_COOKIE.sameSite,
	});
};

const clearRefreshToken = (c: Context) => {
	setCookie(c, REFRESH_TOKEN_COOKIE.name, "", {
		maxAge: 0,
		httpOnly: REFRESH_TOKEN_COOKIE.httpOnly,
		secure: REFRESH_TOKEN_COOKIE.secure,
		sameSite: REFRESH_TOKEN_COOKIE.sameSite,
	});
};

type ZitadelRoles = Record<string, Record<string, string>>;

const parseRoles = (payload: Record<string, unknown>): string[] => {
	const rolesObj = payload["urn:zitadel:iam:org:project:roles"] as
		| ZitadelRoles
		| undefined;
	if (!rolesObj) return [];
	return Object.keys(rolesObj);
};

type TokenClaims = {
	sub: string;
	email: string;
	roles: string[];
};

const userToken = async (claims: TokenClaims) => {
	const now = Math.floor(Date.now() / 1000);

	const token = await sign(
		{
			sub: claims.sub,
			email: claims.email,
			roles: claims.roles,
			iat: now,
			exp: now + 10 * 60,
		},
		environment.AUTH_PRIVATE_KEY,
	);
	return token;
};

const app = new Hono();

app.use(
	"*",
	cors({
		origin: [
			environment.FRONTEND_URL,
			environment.CACHE_BASE_URL,
			"http://localhost:4321", // Local dev testing against production
		],
		credentials: true,
	}),
);

app.post("/login", async (c) => {
	const { code } = await c.req.json();

	if (!code) throwError("Code not provided");

	const params = new URLSearchParams({
		client_id: environment.ZITADEL_CLIENT_ID,
		client_secret: environment.ZITADEL_CLIENT_SECRET,
		redirect_uri: environment.FRONTEND_URL,
		grant_type: "authorization_code",
		code,
	});

	const tokenUrl = `${environment.ZITADEL_ISSUER}/oauth/v2/token`;

	const res = await fetch(tokenUrl, {
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		method: "POST",
		body: params,
	});

	if (res.ok) {
		const result = await res.json();

		const { payload } = decode(result.id_token);

		const email = (payload.email as string) ?? throwError("No email in claim");
		const emailVerified = payload.email_verified as boolean;

		if (!emailVerified) {
			return c.json({ error: "email_unverified" }, 403);
		}

		const roles = parseRoles(payload as Record<string, unknown>);
		const user = await ensureUser(email);
		const token = await userToken({ sub: user.id, email, roles });

		setRefreshToken(c, result.refresh_token);

		return c.json({
			access_token: token,
			sub: user.id,
			roles,
		});
	}

	const errorText = await res.text();
	console.error("Zitadel token exchange failed:", res.status, errorText);
	return c.json({ error: "Authentication failed" }, 401);
});

app.post("/refresh", async (c) => {
	const refreshToken = getCookie(c, REFRESH_TOKEN_COOKIE.name);

	if (!refreshToken) {
		return c.json(
			{
				error: "No refresh token",
			},
			400,
		);
	}

	const params = new URLSearchParams({
		client_id: environment.ZITADEL_CLIENT_ID,
		client_secret: environment.ZITADEL_CLIENT_SECRET,
		grant_type: "refresh_token",
		refresh_token: refreshToken,
	});

	const tokenUrl = `${environment.ZITADEL_ISSUER}/oauth/v2/token`;

	const res = await fetch(tokenUrl, {
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		method: "POST",
		body: params,
	});

	if (res.ok) {
		const result = await res.json();

		const { payload } = decode(result.id_token);

		const email = (payload.email as string) ?? throwError("No email in claim");
		const emailVerified = payload.email_verified as boolean;

		if (!emailVerified) {
			clearRefreshToken(c);
			return c.json({ error: "email_unverified" }, 403);
		}

		const roles = parseRoles(payload as Record<string, unknown>);
		const user = await ensureUser(email);
		const token = await userToken({ sub: user.id, email, roles });

		setRefreshToken(c, result.refresh_token);

		return c.json({
			access_token: token,
			sub: user.id,
			roles,
		});
	}

	const errorText = await res.text();
	console.error("Zitadel token refresh failed:", res.status, errorText);

	clearRefreshToken(c);

	return c.json({ error: "Token refresh failed" }, 401);
});

app.post("/logout", async (c) => {
	clearRefreshToken(c);

	return c.json({ success: true });
});

app.post("/api/mutate", async (c) => {
	return handleMutate(c);
});

app.post("/api/query", async (c) => {
	return handleQuery(c);
});

serve({
	fetch: app.fetch,
	port: 4000,
});
console.log("Server started on port 4000");

import { serve } from "@hono/node-server";
import { throwError } from "@package/common";
import { count, db, dbSchema, eq } from "@package/database/server";
import { createLogger, getMeter } from "@package/instrumentation/utils";
import type { Context } from "hono";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { decode, sign } from "hono/jwt";
import { ensureUser } from "./ensure-user.ts";
import { environment } from "./environment.ts";
import { handleGdprExport } from "./gdpr-export.ts";
import { handleMutate } from "./mutate.ts";
import { handleQuery } from "./query.ts";
import { getAuthContext } from "./util.ts";

const logger = createLogger("backend");
const meter = getMeter("backend");

const requestCounter = meter.createCounter("http.requests", {
	description: "Number of HTTP requests",
});

const requestDuration = meter.createHistogram("http.duration_ms", {
	description: "HTTP request duration in milliseconds",
	unit: "ms",
});

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
	roles: string[];
};

const ACCESS_TOKEN_EXPIRY_SECONDS = 10 * 60;

const userToken = async (claims: TokenClaims) => {
	const now = Math.floor(Date.now() / 1000);

	const token = await sign(
		{
			sub: claims.sub,
			roles: claims.roles,
			iat: now,
			exp: now + ACCESS_TOKEN_EXPIRY_SECONDS,
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

app.use("*", async (c, next) => {
	const start = performance.now();
	await next();
	const duration = performance.now() - start;
	const attributes = {
		method: c.req.method,
		route: c.req.path,
		status: c.res.status,
	};
	requestCounter.add(1, attributes);
	requestDuration.record(duration, attributes);
});

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
		const tokenResponse = await res.json();

		const { payload } = decode(tokenResponse.id_token);

		const zitadelId = (payload.sub as string) ?? throwError("No sub in claim");

		const roles = parseRoles(payload as Record<string, unknown>);
		const user = await ensureUser(zitadelId);
		const token = await userToken({ sub: user.id, roles });

		setRefreshToken(c, tokenResponse.refresh_token);

		return c.json({
			access_token: token,
			expires_in: ACCESS_TOKEN_EXPIRY_SECONDS,
			sub: user.id,
			roles,
		});
	}

	const errorText = await res.text();
	logger.error("Zitadel token exchange failed", {
		status: res.status,
		error: errorText,
	});
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

		const zitadelId = (payload.sub as string) ?? throwError("No sub in claim");

		const roles = parseRoles(payload as Record<string, unknown>);
		const user = await ensureUser(zitadelId);
		const token = await userToken({ sub: user.id, roles });

		setRefreshToken(c, result.refresh_token);

		return c.json({
			access_token: token,
			expires_in: ACCESS_TOKEN_EXPIRY_SECONDS,
			sub: user.id,
			roles,
		});
	}

	const errorText = await res.text();
	logger.error("Zitadel token refresh failed", {
		status: res.status,
		error: errorText,
	});

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

app.get("/api/stats", async (c) => {
	const [pending] = await db
		.select({ count: count() })
		.from(dbSchema.packageFetches)
		.where(eq(dbSchema.packageFetches.status, "pending"));

	return c.json({
		pendingFetches: pending?.count ?? 0,
	});
});

app.get("/api/account/export", handleGdprExport);

app.post("/api/account/delete", async (c) => {
	const ctx = await getAuthContext(c);

	if (ctx.userID === "anon") {
		return c.json({ error: "Not authenticated" }, 401);
	}

	try {
		const now = new Date();
		await db
			.update(dbSchema.account)
			.set({
				name: null,
				deletedAt: now,
				updatedAt: now,
			})
			.where(eq(dbSchema.account.id, ctx.userID));

		clearRefreshToken(c);

		return c.json({ success: true });
	} catch (error) {
		logger.error("Failed to delete account", { error: String(error) });
		return c.json({ error: "Failed to delete account" }, 500);
	}
});

serve({
	fetch: app.fetch,
	port: 4000,
});
logger.info("Server started", { port: 4000 });

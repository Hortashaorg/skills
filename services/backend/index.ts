import { serve } from "@hono/node-server";
import { throwError } from "@package/common";
import { validateAndDecodeAuthData } from "@package/database/server";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { decode, sign } from "hono/jwt";
import { validator } from "hono/validator";
import { ensureUser } from "./ensure-user.ts";
import { environment } from "./environment.ts";
import { handlePush } from "./push.ts";
import { handleQuery } from "./query.ts";

const secretKey = new TextEncoder().encode(environment.AUTH_PRIVATE_KEY);

const userToken = async (sub: string, email: string) => {
	const now = Math.floor(Date.now() / 1000);

	const token = await sign(
		{
			sub,
			email,
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
		origin: ["http://localhost:4321", environment.CACHE_BASE_URL],
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
		const user = await ensureUser(email);
		const token = await userToken(user.id, user.email);

		// biome-ignore lint/suspicious/noExplicitAny: Context type does not fit here.
		setCookie(c as any, "refresh_token", result.refresh_token, {
			maxAge: 6 * 30 * 24 * 60 * 60, // 6 months in seconds
			httpOnly: true,
			secure: environment.NODE_ENV !== "local",
			sameSite: "lax",
		});

		return c.json({
			access_token: token,
			sub: user.id,
		});
	}

	const errorText = await res.text();
	console.error("Zitadel token exchange failed:", res.status, errorText);
	return c.json({ error: "Authentication failed" }, 401);
});

app.post("/refresh", async (c) => {
	const refreshToken = getCookie(c, "refresh_token");

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
		const user = await ensureUser(email);
		const token = await userToken(user.id, user.email);

		// biome-ignore lint/suspicious/noExplicitAny: Context type does not fit here.
		setCookie(c as any, "refresh_token", result.refresh_token, {
			maxAge: 6 * 30 * 24 * 60 * 60, // 6 months in seconds
			httpOnly: true,
			secure: environment.NODE_ENV !== "local",
			sameSite: "lax",
		});

		return c.json({
			access_token: token,
			sub: user.id,
		});
	}

	const errorText = await res.text();
	console.error("Zitadel token refresh failed:", res.status, errorText);

	// Clear the invalid refresh token cookie
	// biome-ignore lint/suspicious/noExplicitAny: Context type does not fit here.
	setCookie(c as any, "refresh_token", "", {
		maxAge: 0,
		httpOnly: true,
		secure: environment.NODE_ENV !== "local",
		sameSite: "lax",
	});

	return c.json({ error: "Token refresh failed" }, 401);
});

app.post(
	"/api/mutate",
	validator("header", (v) => {
		const auth = v.authorization;
		if (!auth) {
			return undefined;
		}
		const parts = /^Bearer (.+)$/.exec(auth);
		if (!parts) {
			throw new Error(
				"Invalid Authorization header - should start with 'Bearer '",
			);
		}
		const [, jwt] = parts;
		if (!jwt) {
			throw new Error("jwt missing");
		}
		return validateAndDecodeAuthData(jwt, secretKey);
	}),
	async (c) => {
		return c.json(await handlePush(c.req.valid("header"), c.req.raw));
	},
);

app.post(
	"/api/query",
	validator("header", (v) => {
		const auth = v.authorization;
		if (!auth) {
			return undefined;
		}
		const parts = /^Bearer (.+)$/.exec(auth);
		if (!parts) {
			throw new Error(
				"Invalid Authorization header - should start with 'Bearer '",
			);
		}
		const [, jwt] = parts;
		if (!jwt) {
			throw new Error("jwt missing");
		}
		return validateAndDecodeAuthData(jwt, secretKey);
	}),
	async (c) => {
		const result = await handleQuery(c.req.valid("header"), c.req.raw);
		return c.json(result);
	},
);

serve({
	fetch: app.fetch,
	port: 4000,
});
console.log("Server started on port 4000");

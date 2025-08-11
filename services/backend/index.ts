import { serve } from "@hono/node-server";
import { throwError } from "@package/common";
import {
	PostgresJSConnection,
	schema,
	ZQLDatabase,
} from "@package/database/server";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { cors } from "hono/cors";
import postgres from "postgres";
import { environment } from "./environment.ts";
import { handlePush } from "./push.ts";

const app = new Hono();

app.use(
	"*",
	cors({
		origin: ["http://localhost:4321", "http://localhost:4848"],
		credentials: true,
	}),
);

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
		client_id: environment.CLIENT_ID,
		client_secret: environment.CLIENT_SECRET,
		grant_type: "refresh_token",
		refresh_token: refreshToken,
	});

	const res = await fetch(`https://oauth2.googleapis.com/token`, {
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		method: "POST",
		body: params,
	});
	if (res.ok) {
		const result = await res.json();

		return c.json({
			access_token: result.access_token,
		});
	} else {
		console.log(res.statusText);
		res.statusText;
	}

	return c.text("Login");
});

app.post("/login", async (c) => {
	const { code } = await c.req.json();

	if (!code) throwError("Code not provided");

	const params = new URLSearchParams({
		client_id: environment.CLIENT_ID,
		client_secret: environment.CLIENT_SECRET,
		redirect_uri: "http://localhost:4321/auth/callback",
		scope: "email",
		grant_type: "authorization_code",
		access_type: "offline",
		prompt: "consent",
		code,
	});

	const res = await fetch(`https://oauth2.googleapis.com/token`, {
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		method: "POST",
		body: params,
	});
	if (res.ok) {
		const result = await res.json();

		// biome-ignore lint/suspicious/noExplicitAny: Context type does not fit here.
		setCookie(c as any, "refresh_token", result.refresh_token, {
			maxAge: 6 * 30 * 24 * 60 * 60, // 6 months in seconds
			httpOnly: true,
			secure: environment.NODE_ENV !== "local",
			sameSite: "lax",
		});

		return c.json({
			access_token: result.access_token,
		});
	} else {
		console.log(res.statusText);
		res.statusText;
	}

	return c.text("Login");
});

app.post("/api/push", async (c) => {
	return c.json(await handlePush(c.req.raw));
});

app.get("/test", async (c) => {
	console.log("test");

	const db = new ZQLDatabase(
		new PostgresJSConnection(postgres(environment.ZERO_UPSTREAM_DB)),
		schema,
	);

	db.transaction(
		async (tx) => {
			await tx.mutate.account.insert({
				email: "test@example.com",
				id: crypto.randomUUID(),
			});
		},
		{
			clientGroupID: "unused",
			clientID: "unused",
			mutationID: 42,
			upstreamSchema: "unused",
		},
	);
	return c.json({
		message: "test",
	});
});

serve({
	fetch: app.fetch,
	port: 4000,
});
console.log("Server started on port 4000");

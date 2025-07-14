import { serve } from "@hono/node-server";
import { throwError } from "@package/common";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { environment } from "./environment.ts";

const app = new Hono();

app.use(
	"*",
	cors({
		origin: "http://localhost:4321",
		credentials: true,
	}),
);

app.post("/login", async (c) => {
	const { code } = await c.req.json();

	// Test

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

		console.log(result);

		// biome-ignore lint/suspicious/noExplicitAny: Context type does not fit here.
		setCookie(c as any, "refresh_token", result.refresh_token, {
			maxAge: 6 * 30 * 24 * 60 * 60 * 1000, // ~6 months in milliseconds
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

serve({
	fetch: app.fetch,
	port: 4000,
});
console.log("Server started on port 4000");

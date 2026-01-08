import { serve } from "@hono/node-server";
import { createLogger } from "@package/instrumentation/utils";
import { Hono } from "hono";

const logger = createLogger("webhook");

const app = new Hono();

app.get("/health", (c) => {
	return c.json({ status: "ok" });
});

app.post("/zitadel", async (c) => {
	try {
		const payload = await c.req.json();

		logger.info("Zitadel webhook received", {
			headers: Object.fromEntries(c.req.raw.headers.entries()),
			payload: JSON.stringify(payload, null, 2),
		});

		return c.json({ received: true });
	} catch (error) {
		logger.error("Failed to parse webhook payload", { error: String(error) });
		return c.json({ error: "Invalid payload" }, 400);
	}
});

const PORT = 4001;

serve({
	fetch: app.fetch,
	port: PORT,
});

logger.info("Webhook server started", { port: PORT });

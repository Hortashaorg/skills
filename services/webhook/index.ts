import { serve } from "@hono/node-server";
import { createLogger } from "@package/instrumentation/utils";
import { Hono } from "hono";
import { handleRetrieveIdentityProviderIntent } from "./handlers/actions.ts";
import {
	handleExternalIdpAdded,
	handleUserRemoved,
} from "./handlers/events.ts";
import type { ActionsV2Payload, ZitadelEvent } from "./types.ts";

const logger = createLogger("webhook");

const app = new Hono();

// Route: Health check
app.get("/health", (c) => {
	return c.json({ status: "ok" });
});

// Route: ZITADEL Events (user.removed, user.human.externalidp.added, etc.)
app.post("/zitadel/events", async (c) => {
	try {
		const rawBody = await c.req.text();
		const event = JSON.parse(rawBody) as ZitadelEvent;

		logger.info("Zitadel event received", {
			event_type: event.event_type,
			aggregateID: event.aggregateID,
		});

		switch (event.event_type) {
			case "user.removed":
				await handleUserRemoved(event);
				break;

			case "user.human.externalidp.added":
				await handleExternalIdpAdded(event);
				break;

			default:
				logger.info("Unhandled event type", { event_type: event.event_type });
		}

		return c.json({ received: true });
	} catch (error) {
		logger.error("Failed to process event", { error: String(error) });
		return c.json({ error: "Processing failed" }, 500);
	}
});

// Route: ZITADEL Actions V2 (Request/Response manipulation)
app.post("/zitadel/actions", async (c) => {
	let context: { fullMethod?: string; userID?: string; orgID?: string } = {};

	try {
		const rawBody = await c.req.text();
		const payload = JSON.parse(rawBody) as ActionsV2Payload;

		context = {
			fullMethod: payload.fullMethod,
			userID: payload.userID,
			orgID: payload.orgID,
		};

		logger.info("Zitadel action received", context);

		// Route to appropriate handler
		switch (payload.fullMethod) {
			case "/zitadel.user.v2.UserService/RetrieveIdentityProviderIntent":
				return handleRetrieveIdentityProviderIntent(payload, c);

			default:
				logger.info("Unhandled method, passing through", {
					fullMethod: payload.fullMethod,
				});
				return c.json({});
		}
	} catch (error) {
		logger.error("Failed to process action", {
			error: String(error),
			...context,
		});
		return c.json({});
	}
});

const PORT = 4001;

serve({
	fetch: app.fetch,
	port: PORT,
});

logger.info("Webhook server started", { port: PORT });

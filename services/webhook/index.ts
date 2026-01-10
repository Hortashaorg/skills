import { serve } from "@hono/node-server";
import { db, softDeleteAccountByZitadelId } from "@package/database/server";
import { createLogger } from "@package/instrumentation/utils";
import type { Context } from "hono";
import { Hono } from "hono";

const logger = createLogger("webhook");

const app = new Hono();

// Cache IDP user data between RetrieveIdentityProviderIntent and AddHumanUser
// Key: `${idpId}:${idpUserId}` -> user data from GitHub/Google
// TTL: 5 minutes (registration should complete quickly)
const idpDataCache = new Map<
	string,
	{
		givenName?: string;
		familyName?: string;
		email?: string;
		emailVerified: boolean;
		timestamp: number;
	}
>();

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function cleanExpiredCache() {
	const now = Date.now();
	for (const [key, value] of idpDataCache.entries()) {
		if (now - value.timestamp > CACHE_TTL_MS) {
			idpDataCache.delete(key);
		}
	}
}

// Types for ZITADEL Events (used by event webhooks)
type ZitadelEvent = {
	aggregateID: string;
	event_type: string;
};

// Types for ZITADEL Actions V2
// See: https://zitadel.com/docs/guides/integrate/actions/testing-response-manipulation
type ActionsV2Payload = {
	fullMethod: string;
	instanceID: string;
	orgID: string;
	userID: string;
	request: {
		// AddHumanUser request fields
		profile?: {
			givenName?: string;
			familyName?: string;
			displayName?: string;
			nickName?: string;
			preferredLanguage?: string;
			gender?: string;
		};
		email?: {
			email?: string;
			isVerified?: boolean;
		};
		idpLinks?: Array<{
			idpId: string;
			userId: string;
			userName: string;
		}>;
	} & Record<string, unknown>;
	response: {
		idpInformation?: {
			oauth?: {
				accessToken: string;
				idToken?: string;
			};
			idpId?: string;
			userId?: string;
			userName?: string;
			rawInformation?: {
				User?: Record<string, unknown>;
			} & Record<string, unknown>;
		};
	};
};

// Parse display name into first/last name
function parseDisplayName(displayName: string | undefined | null): {
	first: string | undefined;
	last: string | undefined;
} {
	if (!displayName || typeof displayName !== "string") {
		return { first: undefined, last: undefined };
	}

	const trimmed = displayName.trim();
	if (trimmed === "") {
		return { first: undefined, last: undefined };
	}

	const parts = trimmed.split(/\s+/);

	if (parts.length === 1) {
		return { first: parts[0], last: undefined };
	}

	return {
		first: parts[0],
		last: parts.slice(1).join(" "),
	};
}

// Handler: RetrieveIdentityProviderIntent (Response manipulation)
// Caches IDP data for use in AddHumanUser, and returns data for auto-updating existing users
function handleRetrieveIdentityProviderIntent(
	payload: ActionsV2Payload,
	c: Context,
) {
	const idpInfo = payload.response?.idpInformation;
	const rawInfo = idpInfo?.rawInformation;
	const userData = rawInfo?.User ?? rawInfo;

	// Extract user data from provider
	const displayName =
		(userData?.name as string) ??
		(userData?.login as string) ??
		idpInfo?.userName;
	const email = userData?.email as string | undefined;
	const providerEmailVerified = userData?.email_verified as boolean | undefined;
	const providerGivenName = userData?.given_name as string | undefined;
	const providerFamilyName = userData?.family_name as string | undefined;

	logger.info("Processing IDP intent", {
		idpId: idpInfo?.idpId,
		displayName,
		email,
		providerEmailVerified,
		hasProviderNames: !!(providerGivenName || providerFamilyName),
	});

	// Determine first/last name
	let givenName: string | undefined;
	let familyName: string | undefined;

	if (providerGivenName) {
		givenName = providerGivenName;
		familyName = providerFamilyName;
	} else if (displayName) {
		const parsed = parseDisplayName(displayName);
		givenName = parsed.first;
		familyName = parsed.last;
	}

	// Cache the IDP data for use in AddHumanUser Request
	if (idpInfo?.idpId && idpInfo?.userId) {
		const cacheKey = `${idpInfo.idpId}:${idpInfo.userId}`;
		idpDataCache.set(cacheKey, {
			givenName,
			familyName,
			email,
			emailVerified: providerEmailVerified !== false,
			timestamp: Date.now(),
		});
		logger.info("Cached IDP data for registration", { cacheKey });
		cleanExpiredCache();
	}

	// Build response for auto-updating existing linked users
	const human: {
		profile?: { givenName?: string; familyName?: string; displayName?: string };
		email?: { email?: string; isVerified?: boolean };
	} = {};

	if (givenName) {
		human.profile = { givenName, familyName, displayName };
		logger.info("Setting user profile", { givenName, familyName });
	}

	if (email) {
		const shouldVerify = providerEmailVerified !== false;
		human.email = { email, isVerified: shouldVerify };
		logger.info("Setting email", { email, isVerified: shouldVerify });
	}

	const response = {
		idpInformation: {
			...idpInfo,
			user: { human },
		},
	};

	logger.info("Returning RetrieveIdentityProviderIntent response", {
		response: JSON.stringify(response),
	});

	return c.json(response);
}

// Handler: AddHumanUser (Request manipulation)
// Injects cached IDP data into the user creation request
function handleAddHumanUser(payload: ActionsV2Payload, c: Context) {
	const request = payload.request;
	const idpLinks = request.idpLinks;

	// Only modify if this is an OAuth registration (has idpLinks)
	if (!idpLinks || idpLinks.length === 0) {
		logger.info("AddHumanUser without idpLinks, passing through");
		return c.json({});
	}

	const idpLink = idpLinks[0];
	if (!idpLink) {
		logger.info("AddHumanUser with empty idpLinks, passing through");
		return c.json({});
	}
	const cacheKey = `${idpLink.idpId}:${idpLink.userId}`;
	const cachedData = idpDataCache.get(cacheKey);

	logger.info("Processing AddHumanUser request", {
		cacheKey,
		hasCachedData: !!cachedData,
		existingProfile: !!request.profile,
		existingEmail: !!request.email,
	});

	// Build modified request
	const modifiedRequest: Record<string, unknown> = { ...request };

	if (cachedData) {
		// Use cached IDP data for profile if available
		if (cachedData.givenName) {
			modifiedRequest.profile = {
				...request.profile,
				givenName: cachedData.givenName,
				familyName: cachedData.familyName ?? request.profile?.familyName,
			};
			logger.info("Injecting profile from cache", {
				givenName: cachedData.givenName,
				familyName: cachedData.familyName,
			});
		}

		// Mark email as verified
		if (cachedData.email && cachedData.emailVerified) {
			modifiedRequest.email = {
				...request.email,
				email: cachedData.email,
				isVerified: true,
			};
			logger.info("Injecting verified email from cache", {
				email: cachedData.email,
			});
		}

		// Clean up used cache entry
		idpDataCache.delete(cacheKey);
	} else {
		// No cached data, but still mark email as verified for OAuth registrations
		// (GitHub requires verified email for OAuth)
		if (request.email?.email) {
			modifiedRequest.email = {
				...request.email,
				isVerified: true,
			};
			logger.info("Marking email as verified (OAuth registration)", {
				email: request.email.email,
			});
		}
	}

	const response = { request: modifiedRequest };

	logger.info("Returning AddHumanUser request modification", {
		response: JSON.stringify(response),
	});

	return c.json(response);
}

// Handler: User deleted in ZITADEL (Event)
async function handleUserRemoved(event: ZitadelEvent): Promise<void> {
	const zitadelId = event.aggregateID;

	logger.info("Processing user.removed event", { zitadelId });

	const result = await softDeleteAccountByZitadelId(db, zitadelId);

	if (result.notFound) {
		logger.warn("No account found for zitadelId", { zitadelId });
	} else if (result.success) {
		logger.info("Account soft-deleted", {
			zitadelId,
			accountId: result.accountId,
		});
	}
}

// Route: Health check
app.get("/health", (c) => {
	return c.json({ status: "ok" });
});

// Route: ZITADEL Events (user.removed, etc.)
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

			case "/zitadel.user.v2.UserService/AddHumanUser":
				return handleAddHumanUser(payload, c);

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

import { serve } from "@hono/node-server";
import { db, softDeleteAccountByZitadelId } from "@package/database/server";
import { createLogger } from "@package/instrumentation/utils";
import type { Context } from "hono";
import { Hono } from "hono";

const logger = createLogger("webhook");

const app = new Hono();

// Environment variables
const ZITADEL_ISSUER = process.env.ZITADEL_ISSUER;
const ZITADEL_SERVICE_TOKEN = process.env.ZITADEL_SERVICE_TOKEN;

// Cache IDP user data between RetrieveIdentityProviderIntent and post-creation
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

// Types for ZITADEL Events
type ZitadelEvent = {
	aggregateID: string;
	aggregateType: string;
	resourceOwner: string;
	instanceID: string;
	event_type: string;
	event_payload?: {
		idpConfigId?: string;
		userId?: string;
		displayName?: string;
		email?: string;
	};
};

// Types for ZITADEL Actions V2
type ActionsV2Payload = {
	fullMethod: string;
	instanceID: string;
	orgID: string;
	userID: string;
	request: Record<string, unknown>;
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

// ZITADEL Management API: Verify user email
async function verifyUserEmail(userId: string): Promise<boolean> {
	if (!ZITADEL_ISSUER || !ZITADEL_SERVICE_TOKEN) {
		logger.warn("ZITADEL API credentials not configured");
		return false;
	}

	try {
		// First get user to find their email
		const userResponse = await fetch(`${ZITADEL_ISSUER}/v2/users/${userId}`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${ZITADEL_SERVICE_TOKEN}`,
				"Content-Type": "application/json",
			},
		});

		if (!userResponse.ok) {
			const error = await userResponse.text();
			logger.error("Failed to get user", {
				userId,
				status: userResponse.status,
				error,
			});
			return false;
		}

		const userData = await userResponse.json();
		const email = userData.user?.human?.email?.email;

		if (!email) {
			logger.warn("User has no email", { userId });
			return false;
		}

		// Check if already verified
		if (userData.user?.human?.email?.isVerified) {
			logger.info("Email already verified", { userId, email });
			return true;
		}

		// Get org ID from user data for the management API header
		const orgId = userData.user?.details?.resourceOwner;

		// Set email as verified using the v1 management API (v2 doesn't support this)
		const verifyResponse = await fetch(
			`${ZITADEL_ISSUER}/management/v1/users/${userId}/email`,
			{
				method: "PUT",
				headers: {
					Authorization: `Bearer ${ZITADEL_SERVICE_TOKEN}`,
					"Content-Type": "application/json",
					...(orgId && { "x-zitadel-orgid": orgId }),
				},
				body: JSON.stringify({
					email: email,
					isEmailVerified: true,
				}),
			},
		);

		if (!verifyResponse.ok) {
			const error = await verifyResponse.text();
			logger.error("Failed to verify user email", {
				userId,
				status: verifyResponse.status,
				error,
			});
			return false;
		}

		logger.info("Marked email as verified", { userId, email });
		return true;
	} catch (error) {
		logger.error("Error verifying email", { userId, error: String(error) });
		return false;
	}
}

// ZITADEL Management API: Add org membership for self-management
async function addOrgMembership(
	userId: string,
	orgId: string,
): Promise<boolean> {
	if (!ZITADEL_ISSUER || !ZITADEL_SERVICE_TOKEN) {
		logger.warn("ZITADEL API credentials not configured");
		return false;
	}

	try {
		const response = await fetch(
			`${ZITADEL_ISSUER}/management/v1/orgs/me/members`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${ZITADEL_SERVICE_TOKEN}`,
					"Content-Type": "application/json",
					"x-zitadel-orgid": orgId,
				},
				body: JSON.stringify({
					userId: userId,
					roles: ["ORG_USER_SELF_MANAGER"],
				}),
			},
		);

		if (!response.ok) {
			const error = await response.text();
			// 409 means already exists
			if (response.status === 409) {
				logger.info("User already has org membership", { userId });
				return true;
			}
			logger.error("Failed to add org membership", {
				userId,
				status: response.status,
				error,
			});
			return false;
		}

		logger.info("Added org membership for self-management", {
			userId,
			roles: ["ORG_USER_SELF_MANAGER"],
		});
		return true;
	} catch (error) {
		logger.error("Error adding org membership", {
			userId,
			error: String(error),
		});
		return false;
	}
}

// Handler: RetrieveIdentityProviderIntent (Response manipulation)
// Caches IDP data for post-creation use, returns data for auto-updating existing users
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

	// Cache the IDP data for post-creation use
	if (idpInfo?.idpId && idpInfo?.userId) {
		const cacheKey = `${idpInfo.idpId}:${idpInfo.userId}`;
		idpDataCache.set(cacheKey, {
			givenName,
			familyName,
			email,
			emailVerified: providerEmailVerified !== false,
			timestamp: Date.now(),
		});
		logger.info("Cached IDP data for post-creation", { cacheKey });
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

// Handler: External IDP linked (Event)
// Called after user registers via OAuth - verify email and assign role
async function handleExternalIdpAdded(event: ZitadelEvent): Promise<void> {
	const zitadelId = event.aggregateID;
	const orgId = event.resourceOwner;
	const idpConfigId = event.event_payload?.idpConfigId;
	const idpUserId = event.event_payload?.userId;
	const displayName = event.event_payload?.displayName;

	logger.info("Processing user.human.externalidp.added event", {
		zitadelId,
		displayName,
	});

	// Try to get cached data from RetrieveIdentityProviderIntent
	let cachedData = null;
	if (idpConfigId && idpUserId) {
		const cacheKey = `${idpConfigId}:${idpUserId}`;
		cachedData = idpDataCache.get(cacheKey);
		if (cachedData) {
			logger.info("Found cached IDP data", { cacheKey });
			idpDataCache.delete(cacheKey);
		}
	}

	// Verify email (GitHub requires verified email for OAuth, so we trust it)
	const emailVerified = await verifyUserEmail(zitadelId);
	if (!emailVerified) {
		logger.warn("Failed to verify email", { zitadelId });
	}

	// Add org membership for self-management (so users can delete their account)
	const membershipAdded = await addOrgMembership(zitadelId, orgId);
	if (!membershipAdded) {
		logger.warn("Failed to assign self-management role", { zitadelId });
	}

	logger.info("Completed post-registration setup", {
		zitadelId,
		emailVerified,
		membershipAdded,
	});
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

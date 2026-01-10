import { serve } from "@hono/node-server";
import { db, softDeleteAccountByZitadelId } from "@package/database/server";
import { createLogger } from "@package/instrumentation/utils";
import { Hono } from "hono";

const logger = createLogger("webhook");

const app = new Hono();

// Types for ZITADEL Events (used by event webhooks)
type ZitadelEvent = {
	aggregateID: string;
	event_type: string;
};

// Types for ZITADEL Actions V2 Response manipulation
// See: https://zitadel.com/docs/guides/integrate/actions/testing-response-manipulation
// Note: Field names use uppercase "ID" suffix per ZITADEL's protobuf conventions
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
			// rawInformation contains provider-specific user data (snake_case from providers)
			// For GitHub: { User: { name, email, login, avatar_url, ... } }
			// For Google: { User: { given_name, family_name, email, email_verified, ... } }
			rawInformation?: {
				User?: Record<string, unknown>;
			} & Record<string, unknown>;
		};
		addHumanUser?: {
			idpLinks?: Array<{
				idpId: string;
				userId: string;
				userName: string;
			}>;
			username?: string;
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
			metadata?: Array<{
				key: string;
				value: string;
			}>;
		};
	};
};

// Parse display name into first/last name
// "John Doe" -> { first: "John", last: "Doe" }
// "John" -> { first: "John", last: undefined }
// "John William Doe" -> { first: "John", last: "William Doe" }
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

// Route: ZITADEL Actions V2 Response manipulation
// Handles RetrieveIdentityProviderIntent to set firstname/lastname and verify email
// See: https://zitadel.com/docs/guides/integrate/actions/migrate-from-v1
app.post("/zitadel/actions", async (c) => {
	// Track non-sensitive metadata for error logging
	let context: { fullMethod?: string; userID?: string; orgID?: string } = {};

	try {
		const rawBody = await c.req.text();
		const payload = JSON.parse(rawBody) as ActionsV2Payload;

		// Store non-sensitive fields for error context
		context = {
			fullMethod: payload.fullMethod,
			userID: payload.userID,
			orgID: payload.orgID,
		};

		logger.info("Zitadel action received", context);

		// Only handle RetrieveIdentityProviderIntent
		if (
			payload.fullMethod !==
			"/zitadel.user.v2.UserService/RetrieveIdentityProviderIntent"
		) {
			logger.info("Unhandled method, passing through", {
				fullMethod: payload.fullMethod,
			});
			return c.json({});
		}

		// Log the full payload structure for debugging (only in development)
		logger.debug("Full payload structure", {
			hasIdpInformation: !!payload.response?.idpInformation,
			hasAddHumanUser: !!payload.response?.addHumanUser,
			rawInfoKeys: payload.response?.idpInformation?.rawInformation
				? Object.keys(payload.response.idpInformation.rawInformation)
				: [],
		});

		// Extract IDP info - GitHub data is under rawInformation.User
		const idpInfo = payload.response?.idpInformation;
		const rawInfo = idpInfo?.rawInformation;
		const userData = rawInfo?.User ?? rawInfo; // Try User object first, fallback to rawInfo

		// GitHub provides: name, email, login, avatar_url, etc. (no email_verified)
		// Google provides: given_name, family_name, email, email_verified, etc.
		const displayName =
			(userData?.name as string) ??
			(userData?.login as string) ??
			idpInfo?.userName;
		const email = userData?.email as string | undefined;
		// Some providers (Google) include email_verified, GitHub doesn't but requires verified email
		const providerEmailVerified = userData?.email_verified as
			| boolean
			| undefined;

		// Check if provider already gave us separate names (like Google)
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
			// Provider gave us structured names (Google, etc.)
			givenName = providerGivenName;
			familyName = providerFamilyName;
		} else if (displayName) {
			// Parse from display name (GitHub)
			const parsed = parseDisplayName(displayName);
			givenName = parsed.first;
			familyName = parsed.last;
		}

		// Start with existing addHumanUser or create new one
		const addHumanUser = payload.response?.addHumanUser ?? {};

		// Set profile if we have name data
		if (givenName) {
			addHumanUser.profile = {
				...addHumanUser.profile,
				givenName,
				familyName: familyName ?? addHumanUser.profile?.familyName,
			};
			logger.info("Setting user profile", {
				givenName,
				familyName,
			});
		}

		// Set email as verified if we have email from the provider
		// - Google: Check email_verified field from provider
		// - GitHub: Doesn't provide email_verified, but requires verified email for OAuth
		// For providers without email_verified, we trust the email if it was provided
		if (email) {
			// If provider explicitly says not verified, don't mark as verified
			const shouldVerify = providerEmailVerified !== false;
			addHumanUser.email = {
				...addHumanUser.email,
				email,
				isVerified: shouldVerify,
			};
			logger.info("Setting email", { email, isVerified: shouldVerify });
		}

		// Return the modified response
		// See: https://zitadel.com/docs/guides/integrate/actions/testing-response-manipulation
		const response = { addHumanUser };

		logger.debug("Returning modified response", {
			hasProfile: !!response.addHumanUser.profile,
			hasEmail: !!response.addHumanUser.email,
		});

		return c.json(response);
	} catch (error) {
		// Log error with non-sensitive context only (no tokens, emails, or raw body)
		logger.error("Failed to process action", {
			error: String(error),
			...context,
		});
		// Return empty object to pass through - don't block user registration
		return c.json({});
	}
});

const PORT = 4001;

serve({
	fetch: app.fetch,
	port: PORT,
});

logger.info("Webhook server started", { port: PORT });

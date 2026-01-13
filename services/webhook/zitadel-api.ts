import { createLogger } from "@package/instrumentation/utils";

const logger = createLogger("webhook:zitadel-api");

const ZITADEL_ISSUER = process.env.ZITADEL_ISSUER;
const ZITADEL_SERVICE_TOKEN = process.env.ZITADEL_SERVICE_TOKEN;

export async function verifyUserEmail(userId: string): Promise<boolean> {
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

export async function addOrgMembership(
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

/**
 * Generates the Zitadel OAuth authorization URL
 */
export function getAuthorizationUrl(): string {
	const issuer = import.meta.env.VITE_ZITADEL_ISSUER;
	const clientId = import.meta.env.VITE_ZITADEL_CLIENT_ID;
	const redirectUri = import.meta.env.VITE_FRONTEND_URL;

	if (!issuer || !clientId) {
		console.error(
			"Missing Zitadel configuration:",
			{ issuer, clientId },
		);
		throw new Error(
			"Zitadel configuration is missing. Please set VITE_ZITADEL_ISSUER and VITE_ZITADEL_CLIENT_ID in your environment.",
		);
	}

	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: "code",
		scope: "openid email profile offline_access",
	});

	return `${issuer}/oauth/v2/authorize?${params.toString()}`;
}

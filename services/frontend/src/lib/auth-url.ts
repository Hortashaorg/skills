const RETURN_URL_KEY = "auth_return_url";

/**
 * Generates the Zitadel OAuth authorization URL.
 * Saves the current path to sessionStorage so we can return after login.
 */
export function getAuthorizationUrl(): string {
	const issuer = import.meta.env.VITE_ZITADEL_ISSUER;
	const clientId = import.meta.env.VITE_ZITADEL_CLIENT_ID;
	const redirectUri = import.meta.env.VITE_FRONTEND_URL;

	if (!issuer || !clientId) {
		console.error("Missing Zitadel configuration:", { issuer, clientId });
		throw new Error(
			"Zitadel configuration is missing. Please set VITE_ZITADEL_ISSUER and VITE_ZITADEL_CLIENT_ID in your environment.",
		);
	}

	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		response_type: "code",
		scope: "openid email profile offline_access",
		prompt: "select_account",
	});

	return `${issuer}/oauth/v2/authorize?${params.toString()}`;
}

/**
 * Saves the current URL path to sessionStorage before redirecting to OAuth.
 * Call this before navigating to getAuthorizationUrl().
 */
export function saveReturnUrl(): void {
	const currentPath = window.location.pathname + window.location.search;
	if (currentPath !== "/") {
		sessionStorage.setItem(RETURN_URL_KEY, currentPath);
	}
}

/**
 * Gets and clears the saved return URL from sessionStorage.
 * Returns null if no return URL was saved or if it was the home page.
 */
export function getAndClearReturnUrl(): string | null {
	const returnUrl = sessionStorage.getItem(RETURN_URL_KEY);
	sessionStorage.removeItem(RETURN_URL_KEY);
	return returnUrl;
}

/**
 * Gets the Zitadel account management URL where users can manage their profile,
 * resend verification emails, etc.
 */
export function getZitadelAccountUrl(): string {
	const issuer = import.meta.env.VITE_ZITADEL_ISSUER;
	if (!issuer) {
		throw new Error("VITE_ZITADEL_ISSUER is not configured");
	}
	return `${issuer}/ui/console/users/me`;
}

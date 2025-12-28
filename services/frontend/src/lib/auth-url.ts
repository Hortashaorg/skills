import { getConfig } from "./config";

const RETURN_URL_KEY = "auth_return_url";

/**
 * Generates the Zitadel OAuth authorization URL.
 * Saves the current path to sessionStorage so we can return after login.
 */
export function getAuthorizationUrl(): string {
	const config = getConfig();

	const params = new URLSearchParams({
		client_id: config.zitadelClientId,
		redirect_uri: config.frontendUrl,
		response_type: "code",
		scope: "openid email profile offline_access",
		prompt: "select_account",
	});

	return `${config.zitadelIssuer}/oauth/v2/authorize?${params.toString()}`;
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
	const config = getConfig();
	return `${config.zitadelIssuer}/ui/console/users/me`;
}

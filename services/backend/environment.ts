import { throwError } from "@package/common";

export const environment = {
	// Zitadel OIDC Configuration
	get ZITADEL_ISSUER() {
		return (
			process.env.ZITADEL_ISSUER ??
			throwError("Env Variable: ZITADEL_ISSUER not found")
		);
	},
	get ZITADEL_CLIENT_ID() {
		return (
			process.env.ZITADEL_CLIENT_ID ??
			throwError("Env Variable: ZITADEL_CLIENT_ID not found")
		);
	},
	get ZITADEL_CLIENT_SECRET() {
		return (
			process.env.ZITADEL_CLIENT_SECRET ??
			throwError("Env Variable: ZITADEL_CLIENT_SECRET not found")
		);
	},
	// Application Configuration
	get NODE_ENV() {
		return (
			process.env.NODE_ENV ?? throwError("Env Variable: NODE_ENV not found")
		);
	},
	get FRONTEND_URL() {
		return (
			process.env.FRONTEND_URL ??
			throwError("Env Variable: FRONTEND_URL not found")
		);
	},
	// Zero Cache base url
	get CACHE_BASE_URL() {
		return (
			process.env.CACHE_BASE_URL ??
			throwError("Env Variable: CACHE_BASE_URL not found")
		);
	},
	// Database Configuration
	get ZERO_UPSTREAM_DB() {
		return (
			process.env.ZERO_UPSTREAM_DB ??
			throwError("Env Variable: ZERO_UPSTREAM_DB not found")
		);
	},
	// JWT Configuration
	get AUTH_PRIVATE_KEY() {
		return (
			process.env.AUTH_PRIVATE_KEY ??
			throwError("Env Variable: AUTH_PRIVATE_KEY not found")
		);
	},
} as const;

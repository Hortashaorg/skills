import { throwError } from "@package/common";

export const environment = {
	// Zitadel OIDC Configuration
	ZITADEL_ISSUER:
		process.env.ZITADEL_ISSUER ??
		throwError("Env Variable: ZITADEL_ISSUER not found"),
	ZITADEL_CLIENT_ID:
		process.env.ZITADEL_CLIENT_ID ??
		throwError("Env Variable: ZITADEL_CLIENT_ID not found"),
	ZITADEL_CLIENT_SECRET:
		process.env.ZITADEL_CLIENT_SECRET ??
		throwError("Env Variable: ZITADEL_CLIENT_SECRET not found"),

	// Application Configuration
	NODE_ENV:
		process.env.NODE_ENV ?? throwError("Env Variable: NODE_ENV not found"),
	FRONTEND_URL:
		process.env.FRONTEND_URL ??
		throwError("Env Variable: FRONTEND_URL not found"),

	// Zero Cache base url
	CACHE_BASE_URL:
		process.env.CACHE_BASE_URL ??
		throwError("Env Variable: CACHE_BASE_URL not found"),

	// Database Configuration
	ZERO_UPSTREAM_DB:
		process.env.ZERO_UPSTREAM_DB ??
		throwError("Env Variable: ZERO_UPSTREAM_DB not found"),

	// JWT Configuration
	AUTH_PRIVATE_KEY:
		process.env.AUTH_PRIVATE_KEY ??
		throwError("Env Variable: AUTH_PRIVATE_KEY not found"),
} as const;

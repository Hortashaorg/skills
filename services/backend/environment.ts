import { throwError } from "@package/common";

export const environment = {
	CLIENT_SECRET:
		process.env.CLIENT_SECRET ??
		throwError("Env Variable: CLIENT_SECRET not found"),
	CLIENT_ID:
		process.env.CLIENT_ID ?? throwError("Env Variable: CLIENT_ID not found"),
	NODE_ENV:
		process.env.NODE_ENV ?? throwError("Env Variable: NODE_ENV not found"),
	ZERO_UPSTREAM_DB:
		process.env.ZERO_UPSTREAM_DB ??
		throwError("Env Variable: ZERO_UPSTREAM_DB not found"),
	AUTH_PRIVATE_KEY:
		process.env.AUTH_PRIVATE_KEY ??
		throwError("Env Variable: AUTH_PRIVATE_KEY not found"),
} as const;

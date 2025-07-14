import { throwError } from "@package/common";

export const environment = {
	CLIENT_SECRET:
		process.env.CLIENT_SECRET ??
		throwError("Env Variable: CLIENT_SECRET not found"),
	CLIENT_ID:
		process.env.CLIENT_ID ?? throwError("Env Variable: CLIENT_ID not found"),
	NODE_ENV:
		process.env.NODE_ENV ?? throwError("Env Variable: NODE_ENV not found"),
} as const;

import { throwError } from "@package/common";

export const environment = {
	// Application Configuration
	get NODE_ENV() {
		return (
			process.env.NODE_ENV ?? throwError("Env Variable: NODE_ENV not found")
		);
	},
	// Database Configuration
	get ZERO_UPSTREAM_DB() {
		return (
			process.env.ZERO_UPSTREAM_DB ??
			throwError("Env Variable: ZERO_UPSTREAM_DB not found")
		);
	},
} as const;

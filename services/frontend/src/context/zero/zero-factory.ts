import { createZero, mutators, schema } from "@package/database/client";
import type { AuthData } from "../auth/types";

export class ZeroFactory {
	private serverUrl: string;

	constructor() {
		this.serverUrl = "http://localhost:4848";
	}

	createAuthenticated(authData: AuthData) {
		return createZero({
			auth: authData.accessToken,
			userID: authData.userId,
			server: this.serverUrl,
			schema,
			mutators,
		});
	}

	createAnonymous() {
		return createZero({
			userID: "anon",
			server: this.serverUrl,
			schema,
			mutators,
		});
	}
}

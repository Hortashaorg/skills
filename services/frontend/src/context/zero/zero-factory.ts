import {
	createMutators,
	createZero,
	decodeAuthData,
	type Mutators,
	schema,
	type Zero,
} from "@package/database/client";
import type { AuthData } from "../auth/types";

export class ZeroFactory {
	private serverUrl: string;

	constructor() {
		this.serverUrl = "http://localhost:4848";
	}

	createAuthenticated(authData: AuthData): Zero<typeof schema, Mutators> {
		const decodedAuth = decodeAuthData(authData.accessToken);

		return createZero({
			auth: authData.accessToken,
			userID: authData.userId,
			server: this.serverUrl,
			schema,
			mutators: createMutators(decodedAuth),
		});
	}

	createAnonymous(): Zero<typeof schema, Mutators> {
		return createZero({
			userID: "anon",
			server: this.serverUrl,
			schema,
			mutators: createMutators(undefined),
		});
	}
}

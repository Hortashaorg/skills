import type { CustomMutatorDefs } from "@rocicorp/zero";
import type { AuthData } from "./utils.ts";

export function createMutators(authData: AuthData | undefined) {
	return {
		test: {
			async create(_tx, message: string) {
				mustBeLoggedIn(authData);
				console.log(message);
			},
		},
	} as const satisfies CustomMutatorDefs;
}

function mustBeLoggedIn(authData: AuthData | undefined): AuthData {
	if (authData === undefined) {
		throw new Error("Must be logged in");
	}
	return authData;
}

export type Mutators = ReturnType<typeof createMutators>;

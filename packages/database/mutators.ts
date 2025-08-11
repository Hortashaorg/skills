import type { CustomMutatorDefs } from "@rocicorp/zero";
import type { schema } from "./schema.ts";

export function createMutators() {
	return {
		test: {
			async create(_tx, message: string) {
				console.log(message);
			},
		},
	} as const satisfies CustomMutatorDefs<typeof schema>;
}

export type Mutators = ReturnType<typeof createMutators>;

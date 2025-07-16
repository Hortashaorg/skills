import type { CustomMutatorDefs } from "@rocicorp/zero";
import type { schema } from "./schema.ts";

export function createMutators() {
	return {
		test: {
			async create(tx, message: string) {
				await tx.mutate.message.insert({ id: crypto.randomUUID(), message });
			},
		},
	} as const satisfies CustomMutatorDefs<typeof schema>;
}

export type Mutators = ReturnType<typeof createMutators>;

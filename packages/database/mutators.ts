import type { CustomMutatorDefs } from "@rocicorp/zero";
import type { Message, schema } from "./schema.ts";

export function createMutators() {
	return {
		test: {
			async create(tx, message: Message) {
				console.log("create");
				await tx.mutate.message.insert(message);
			},
		},
	} as const satisfies CustomMutatorDefs<typeof schema>;
}

export type Mutators = ReturnType<typeof createMutators>;

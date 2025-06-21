import type { CustomMutatorDefs } from "@rocicorp/zero";
import type { schema } from "./schema.ts";

export const createMutators = () => {
    return {
        message: {
            async create(tx, message: string) {
                await tx.mutate.message.insert({
                    id: null,
                    message,
                });
            },
        },
    } as const satisfies CustomMutatorDefs<typeof schema>;
};

export type Mutators = ReturnType<typeof createMutators>;

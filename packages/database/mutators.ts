import { defineMutator, defineMutators } from "@rocicorp/zero";
import { z } from "zod";
import "./types/context.ts";

export const mutators = defineMutators({
	test: {
		create: defineMutator(
			z.object({ message: z.string() }),
			async ({ ctx, args }) => {
				// ctx.userID is automatically injected from ZeroContext
				// Authentication is implicitly required since context is needed
				console.log(`[User ${ctx.userID}]:`, args.message);
			},
		),
	},
});

export type Mutators = typeof mutators;

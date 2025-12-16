import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";

export const create = defineMutator(
	z.object({ message: z.string() }),
	async ({ ctx, args }) => {
		console.log(`[User ${ctx.userID}]:`, args.message);
	},
);

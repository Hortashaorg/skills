import { z } from "@package/common";
import { defineMutator } from "@rocicorp/zero";
import { now } from "./helpers.ts";

export const updateName = defineMutator(
	z.object({
		name: z
			.string()
			.min(1, "Username is required")
			.max(50, "Username must be 50 characters or less")
			.regex(
				/^[a-zA-Z0-9_-]+$/,
				"Username can only contain letters, numbers, underscores, and hyphens",
			),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to update account");
		}

		await tx.mutate.account.update({
			id: ctx.userID,
			name: args.name,
			updatedAt: now(),
		});
	},
);

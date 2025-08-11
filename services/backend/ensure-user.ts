import { throwError } from "@package/common";
import { db } from "./util.ts";

export const ensureUser = async (email: string) => {
	const account = await db.transaction(
		async (tx) => {
			const [account] = await tx.query.account.where("email", "=", email);
			if (account) {
				return account;
			}

			const accountData = {
				email,
				id: crypto.randomUUID() as string,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			};

			await tx.mutate.account.insert(accountData);

			const [insertedAccount] = await tx.query.account.where(
				"email",
				"=",
				email,
			);

			return insertedAccount ?? throwError("Failed to get account");
		},
		{
			clientGroupID: "unused",
			clientID: "unused",
			mutationID: 42,
			upstreamSchema: "unused",
		},
	);

	return account;
};

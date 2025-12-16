import { throwError } from "@package/common";
import { dbProvider, zql } from "@package/database/server";

export const ensureUser = async (email: string) => {
	const account = await dbProvider.transaction(async (tx) => {
		// Check if user exists
		const existing = await tx.run(zql.account.where("email", email).one());

		if (existing) {
			return existing;
		}

		// Create new user
		const id = crypto.randomUUID();
		const now = Date.now();

		await tx.mutate.account.insert({
			id,
			email,
			createdAt: now,
			updatedAt: now,
		});

		return tx
			.run(zql.account.where("id", id).one())
			.then((account) => account ?? throwError("Failed to create account"));
	});

	return account;
};

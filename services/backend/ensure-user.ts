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

		const user = { id, email, name: null, createdAt: now, updatedAt: now };
		await tx.mutate.account.insert(user);

		return user;
	});

	return account;
};

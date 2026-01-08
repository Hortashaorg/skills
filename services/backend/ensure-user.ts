import { dbProvider, zql } from "@package/database/server";

export const ensureUser = async (zitadelId: string) => {
	const account = await dbProvider.transaction(async (tx) => {
		// Only find active (non-deleted) accounts
		const existing = await tx.run(
			zql.account
				.where("zitadelId", zitadelId)
				.where("deletedAt", "IS", null)
				.one(),
		);
		if (existing) {
			return existing;
		}

		// Create new account (works even if deleted account with same zitadelId exists)
		const id = crypto.randomUUID();
		const now = Date.now();
		const user = {
			id,
			zitadelId,
			name: null,
			createdAt: now,
			updatedAt: now,
		};
		await tx.mutate.account.insert(user);

		return user;
	});

	return account;
};

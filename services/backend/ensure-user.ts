import { dbProvider, zql } from "@package/database/server";

export const ensureUser = async (zitadelId: string) => {
	const account = await dbProvider.transaction(async (tx) => {
		const existing = await tx.run(
			zql.account.where("zitadelId", zitadelId).one(),
		);
		if (existing) {
			return existing;
		}

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

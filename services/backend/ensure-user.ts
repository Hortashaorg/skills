import { dbProvider, zql } from "@package/database/server";

type EnsureUserParams = {
	zitadelId: string;
	email: string;
};

export const ensureUser = async ({ zitadelId, email }: EnsureUserParams) => {
	const account = await dbProvider.transaction(async (tx) => {
		const byZitadelId = await tx.run(
			zql.account.where("zitadelId", zitadelId).one(),
		);
		if (byZitadelId) {
			return byZitadelId;
		}

		const byEmail = await tx.run(zql.account.where("email", email).one());
		if (byEmail) {
			await tx.mutate.account.update({
				id: byEmail.id,
				zitadelId,
				updatedAt: Date.now(),
			});
			return { ...byEmail, zitadelId };
		}

		const id = crypto.randomUUID();
		const now = Date.now();
		const user = {
			id,
			email,
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

type AccountLike = {
	name?: string | null;
	deletedAt?: Date | number | null;
};

export const getDisplayName = (
	account: AccountLike | null | undefined,
): string => {
	if (!account) return "Anonymous";
	if (account.deletedAt) return "Deleted User";
	if (account.name) return account.name;
	return "Anonymous";
};

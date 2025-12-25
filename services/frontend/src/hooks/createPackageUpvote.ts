import { mutators, useZero } from "@package/database/client";

type PackageWithUpvotes = {
	id: string;
	upvotes?: readonly { id: string; accountId: string }[];
};

export function createPackageUpvote(pkg: () => PackageWithUpvotes) {
	const zero = useZero();

	const isUpvoted = () => {
		const userId = zero().userID;
		return pkg().upvotes?.some((u) => u.accountId === userId) ?? false;
	};

	const upvoteCount = () => pkg().upvotes?.length ?? 0;

	const isDisabled = () => zero().userID === "anon";

	const toggle = async () => {
		const userId = zero().userID;
		if (userId === "anon") return;

		const existingUpvote = pkg().upvotes?.find((u) => u.accountId === userId);

		if (existingUpvote) {
			zero().mutate(mutators.packageUpvotes.remove({ id: existingUpvote.id }));
		} else {
			zero().mutate(mutators.packageUpvotes.create({ packageId: pkg().id }));
		}
	};

	return {
		isUpvoted,
		upvoteCount,
		isDisabled,
		toggle,
	};
}

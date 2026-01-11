import { mutators, useZero } from "@package/database/client";
import { handleMutationError } from "@/lib/mutation-error";

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

		try {
			if (existingUpvote) {
				const res = await zero().mutate(
					mutators.packageUpvotes.remove({
						id: existingUpvote.id,
						packageId: pkg().id,
					}),
				).client;
				if (res.type === "error") {
					throw res.error;
				}
			} else {
				const res = await zero().mutate(
					mutators.packageUpvotes.create({ packageId: pkg().id }),
				).client;
				if (res.type === "error") {
					throw res.error;
				}
			}
		} catch (err) {
			handleMutationError(err, "update upvote");
		}
	};

	return {
		isUpvoted,
		upvoteCount,
		isDisabled,
		toggle,
	};
}

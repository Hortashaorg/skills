import { mutators, useZero } from "@package/database/client";
import { handleMutationError } from "@/lib/mutation-error";

type EcosystemWithUpvotes = {
	id: string;
	upvotes?: readonly { id: string; accountId: string }[];
};

export function createEcosystemUpvote(ecosystem: () => EcosystemWithUpvotes) {
	const zero = useZero();

	const isUpvoted = () => {
		const userId = zero().userID;
		return ecosystem().upvotes?.some((u) => u.accountId === userId) ?? false;
	};

	const upvoteCount = () => ecosystem().upvotes?.length ?? 0;

	const isDisabled = () => zero().userID === "anon";

	const toggle = async () => {
		const userId = zero().userID;
		if (userId === "anon") return;

		const existingUpvote = ecosystem().upvotes?.find(
			(u) => u.accountId === userId,
		);

		try {
			if (existingUpvote) {
				const res = await zero().mutate(
					mutators.ecosystemUpvotes.remove({
						id: existingUpvote.id,
						ecosystemId: ecosystem().id,
					}),
				).client;
				if (res.type === "error") {
					throw res.error;
				}
			} else {
				const res = await zero().mutate(
					mutators.ecosystemUpvotes.create({ ecosystemId: ecosystem().id }),
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

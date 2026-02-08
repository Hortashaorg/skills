import { mutators, useZero } from "@package/database/client";
import { handleMutationError } from "@/lib/mutation-error";

export type UpvotableEntity = {
	id: string;
	upvotes?: readonly { id: string; accountId: string }[];
};

export type EntityType = "package" | "ecosystem" | "project";

export function createUpvote<T extends UpvotableEntity>(
	entity: () => T,
	entityType: EntityType,
) {
	const zero = useZero();

	const isUpvoted = () => {
		const userId = zero().userID;
		return entity().upvotes?.some((u) => u.accountId === userId) ?? false;
	};

	const upvoteCount = () => entity().upvotes?.length ?? 0;

	const isDisabled = () => zero().userID === "anon";

	const toggle = async () => {
		const userId = zero().userID;
		if (userId === "anon") return;

		const existingUpvote = entity().upvotes?.find(
			(u) => u.accountId === userId,
		);

		try {
			if (entityType === "package") {
				if (existingUpvote) {
					const res = await zero().mutate(
						mutators.packageUpvotes.remove({
							id: existingUpvote.id,
							packageId: entity().id,
						}),
					).client;
					if (res.type === "error") throw res.error;
				} else {
					const res = await zero().mutate(
						mutators.packageUpvotes.create({ packageId: entity().id }),
					).client;
					if (res.type === "error") throw res.error;
				}
			} else if (entityType === "ecosystem") {
				if (existingUpvote) {
					const res = await zero().mutate(
						mutators.ecosystemUpvotes.remove({
							id: existingUpvote.id,
							ecosystemId: entity().id,
						}),
					).client;
					if (res.type === "error") throw res.error;
				} else {
					const res = await zero().mutate(
						mutators.ecosystemUpvotes.create({ ecosystemId: entity().id }),
					).client;
					if (res.type === "error") throw res.error;
				}
			} else {
				if (existingUpvote) {
					const res = await zero().mutate(
						mutators.projectUpvotes.remove({
							id: existingUpvote.id,
							projectId: entity().id,
						}),
					).client;
					if (res.type === "error") throw res.error;
				} else {
					const res = await zero().mutate(
						mutators.projectUpvotes.create({ projectId: entity().id }),
					).client;
					if (res.type === "error") throw res.error;
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

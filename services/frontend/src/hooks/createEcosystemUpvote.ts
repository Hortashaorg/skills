import { createUpvote, type UpvotableEntity } from "./createUpvote";

type EcosystemWithUpvotes = UpvotableEntity;

export function createEcosystemUpvote(ecosystem: () => EcosystemWithUpvotes) {
	return createUpvote(ecosystem, "ecosystem");
}

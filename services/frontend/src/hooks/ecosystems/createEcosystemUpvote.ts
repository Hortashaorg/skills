import { createUpvote, type UpvotableEntity } from "@/hooks/createUpvote";

type EcosystemWithUpvotes = UpvotableEntity;

export function createEcosystemUpvote(ecosystem: () => EcosystemWithUpvotes) {
	return createUpvote(ecosystem, "ecosystem");
}

import { createUpvote, type UpvotableEntity } from "@/hooks/createUpvote";

type ProjectWithUpvotes = UpvotableEntity;

export function createProjectUpvote(project: () => ProjectWithUpvotes) {
	return createUpvote(project, "project");
}

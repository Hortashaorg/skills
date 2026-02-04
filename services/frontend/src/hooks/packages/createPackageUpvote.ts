import { createUpvote, type UpvotableEntity } from "@/hooks/createUpvote";

type PackageWithUpvotes = UpvotableEntity;

export function createPackageUpvote(pkg: () => PackageWithUpvotes) {
	return createUpvote(pkg, "package");
}

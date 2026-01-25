import { createUpvote, type UpvotableEntity } from "./createUpvote";

type PackageWithUpvotes = UpvotableEntity;

export function createPackageUpvote(pkg: () => PackageWithUpvotes) {
	return createUpvote(pkg, "package");
}

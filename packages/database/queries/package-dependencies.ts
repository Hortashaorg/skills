import { defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import { zql } from "../zero-schema.gen.ts";

// Monitor unlinked dependencies (where dependencyPackageId is null)
// Zero doesn't support NULL filtering - must filter client-side
export const unlinked = defineQuery(() => {
	return zql.packageDependencies.orderBy("createdAt", "asc").limit(100);
});

// Get dependencies for a specific package version
export const byVersionId = defineQuery(
	z.object({ versionId: z.string() }),
	({ args }) => {
		return zql.packageDependencies.where("versionId", args.versionId);
	},
);

// Get dependencies for a package (all versions)
export const byPackageId = defineQuery(
	z.object({ packageId: z.string() }),
	({ args }) => {
		return zql.packageDependencies.where("packageId", args.packageId);
	},
);

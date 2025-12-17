import { defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import { zql } from "../zero-schema.gen.ts";

// Monitor unlinked dependencies (where dependencyPackageId is null)
export const unlinked = defineQuery(() => {
	return zql.packageDependencies.orderBy("createdAt", "asc").limit(100);
	// Note: Can't filter by NULL in Zero's where clause
	// Will need to filter client-side or handle in worker
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

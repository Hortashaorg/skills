import { z } from "@package/common";
import { defineQuery } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";

export const byPackageId = defineQuery(
	z.object({ packageId: z.string() }),
	({ args }) => {
		// Try without .related() to debug sync issue
		return zql.packageTags.where("packageId", args.packageId);
	},
);

export const byTagId = defineQuery(
	z.object({ tagId: z.string() }),
	({ args }) => {
		return zql.packageTags.where("tagId", args.tagId);
	},
);

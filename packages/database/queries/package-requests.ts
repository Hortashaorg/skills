import { defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import { enums } from "../db/types.ts";
import { zql } from "../zero-schema.gen.ts";

// Get pending requests for worker to process
export const pending = defineQuery(() => {
	return zql.packageRequests
		.where("status", "pending")
		.limit(10)
		.orderBy("createdAt", "asc");
});

// Get pending/fetching requests for a specific package (deduplication check)
export const existingPending = defineQuery(
	z.object({
		packageName: z.string(),
		registry: z.enum(enums.registry),
	}),
	({ args }) => {
		return zql.packageRequests
			.where("packageName", args.packageName)
			.where("registry", args.registry);
		// Note: Can't filter by status IN ('pending', 'fetching') directly in Zero
		// Will need to filter client-side or use separate queries
	},
);

// Get request by ID
export const byId = defineQuery(z.object({ id: z.string() }), ({ args }) => {
	return zql.packageRequests.where("id", args.id).one();
});

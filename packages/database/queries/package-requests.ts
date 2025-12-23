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
		// Zero doesn't support IN operator - filter status client-side
		return zql.packageRequests
			.where("packageName", args.packageName)
			.where("registry", args.registry);
	},
);

// Get request by ID
export const byId = defineQuery(z.object({ id: z.string() }), ({ args }) => {
	return zql.packageRequests.where("id", args.id).one();
});

// Get all requests for admin dashboard (for counting and filtering client-side)
export const all = defineQuery(() => zql.packageRequests);

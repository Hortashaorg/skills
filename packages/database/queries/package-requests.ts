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
			.where("registry", args.registry)
			.where("status", "IN", ["pending", "fetching"]);
	},
);

// Get request by ID
export const byId = defineQuery(z.object({ id: z.string() }), ({ args }) => {
	return zql.packageRequests.where("id", args.id).one();
});

// Get requests by status for admin dashboard (admin-only access)
// Pending/fetching sorted by createdAt (FIFO), others by updatedAt (newest first)
export const byStatus = defineQuery(
	z.object({
		status: z.enum(enums.packageRequestStatus),
	}),
	({ ctx, args }) => {
		if (!ctx.roles.includes("admin")) {
			throw new Error("Unauthorized: admin role required");
		}

		const isPending = args.status === "pending" || args.status === "fetching";

		return zql.packageRequests
			.where("status", args.status)
			.orderBy(
				isPending ? "createdAt" : "updatedAt",
				isPending ? "asc" : "desc",
			);
	},
);

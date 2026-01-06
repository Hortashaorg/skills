import { z } from "@package/common";
import { defineQuery } from "@rocicorp/zero";
import { enums } from "../db/types.ts";
import { zql } from "../zero-schema.gen.ts";

// Get pending fetches for worker to process
export const pending = defineQuery(() => {
	return zql.packageFetches
		.where("status", "pending")
		.orderBy("createdAt", "asc")
		.limit(50);
});

// Check if a package has any pending fetch
export const hasPending = defineQuery(
	z.object({ packageId: z.string() }),
	({ args }) => {
		return zql.packageFetches
			.where("packageId", args.packageId)
			.where("status", "pending")
			.one();
	},
);

// Get fetch by ID
export const byId = defineQuery(z.object({ id: z.string() }), ({ args }) => {
	return zql.packageFetches.where("id", args.id).one();
});

// Get fetch history for a package
export const byPackageId = defineQuery(
	z.object({ packageId: z.string() }),
	({ args }) => {
		return zql.packageFetches
			.where("packageId", args.packageId)
			.orderBy("createdAt", "desc");
	},
);

// Get fetches by status for admin dashboard
export const byStatus = defineQuery(
	z.object({ status: z.enum(enums.fetchStatus) }),
	({ ctx, args }) => {
		if (!ctx.roles.includes("admin")) {
			throw new Error("Unauthorized: admin role required");
		}

		const isPending = args.status === "pending";

		return zql.packageFetches
			.where("status", args.status)
			.orderBy(
				isPending ? "createdAt" : "completedAt",
				isPending ? "asc" : "desc",
			)
			.related("package");
	},
);

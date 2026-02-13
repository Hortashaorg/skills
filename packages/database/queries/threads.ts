import { z } from "@package/common";
import { defineQuery } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";

export const byPackageId = defineQuery(
	z.object({ packageId: z.string() }),
	({ args }) => {
		return zql.threads
			.where("packageId", args.packageId)
			.related("comments", (c) => c.related("author").related("replies"))
			.one();
	},
);

export const byEcosystemId = defineQuery(
	z.object({ ecosystemId: z.string() }),
	({ args }) => {
		return zql.threads
			.where("ecosystemId", args.ecosystemId)
			.related("comments", (c) => c.related("author").related("replies"))
			.one();
	},
);

export const byProjectId = defineQuery(
	z.object({ projectId: z.string() }),
	({ args }) => {
		return zql.threads
			.where("projectId", args.projectId)
			.related("comments", (c) => c.related("author").related("replies"))
			.one();
	},
);

export const byProjectPackageId = defineQuery(
	z.object({ projectPackageId: z.string() }),
	({ args }) => {
		return zql.threads
			.where("projectPackageId", args.projectPackageId)
			.related("comments", (c) => c.related("author").related("replies"))
			.one();
	},
);

export const byProjectEcosystemId = defineQuery(
	z.object({ projectEcosystemId: z.string() }),
	({ args }) => {
		return zql.threads
			.where("projectEcosystemId", args.projectEcosystemId)
			.related("comments", (c) => c.related("author").related("replies"))
			.one();
	},
);

export const byId = defineQuery(z.object({ id: z.string() }), ({ args }) => {
	return zql.threads
		.where("id", args.id)
		.related("comments", (c) => c.related("author").related("replies"))
		.one();
});

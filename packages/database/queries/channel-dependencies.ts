import { z } from "@package/common";
import { defineQuery } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";

// Get dependencies for a specific release channel
export const byChannelId = defineQuery(
	z.object({ channelId: z.string() }),
	({ args }) => {
		return zql.channelDependencies
			.where("channelId", args.channelId)
			.related("dependencyPackage", (p) =>
				p.related("upvotes").related("packageTags", (pt) => pt.related("tag")),
			);
	},
);

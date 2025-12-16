import { defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import { zql } from "../zero-schema.gen.ts";

export const allTags = defineQuery(() => {
	return zql.tag;
});

export const tagById = defineQuery(
	z.object({ id: z.string() }),
	({ args: { id } }) => {
		return zql.tag.where("id", id);
	},
);

export const tagWithTech = defineQuery(
	z.object({ id: z.string() }),
	({ args: { id } }) => {
		return zql.tag
			.where("id", id)
			.related("tagsToTech", (q) => q.related("tech"));
	},
);

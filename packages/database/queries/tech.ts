import { defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import { zql } from "../zero-schema.gen.ts";

export const allTech = defineQuery(() => {
	return zql.tech;
});

export const techById = defineQuery(
	z.object({ id: z.string() }),
	({ args: { id } }) => {
		return zql.tech.where("id", id);
	},
);

export const techWithTags = defineQuery(
	z.object({ id: z.string() }),
	({ args: { id } }) => {
		return zql.tech
			.where("id", id)
			.related("tagsToTech", (q) => q.related("tag"));
	},
);

export const searchTech = defineQuery(
	z.object({ query: z.string() }),
	({ args: { query } }) => {
		return zql.tech.where("name", "LIKE", `%${query}%`);
	},
);

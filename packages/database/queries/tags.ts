import { defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import { zql } from "../zero-schema.gen.ts";

export const list = defineQuery(() => {
	return zql.tags;
});

export const byId = defineQuery(z.object({ id: z.string() }), ({ args }) => {
	return zql.tags.where("id", args.id).one();
});

export const bySlug = defineQuery(
	z.object({ slug: z.string() }),
	({ args }) => {
		return zql.tags.where("slug", args.slug).one();
	},
);

export const withPackages = defineQuery(() => {
	return zql.tags;
});

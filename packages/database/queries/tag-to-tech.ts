import { defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import { zql } from "../zero-schema.gen.ts";

export const techTagsByTechId = defineQuery(
	z.object({ techId: z.string() }),
	({ args: { techId } }) => {
		return zql.tagToTech.where("techId", techId).related("tag");
	},
);

export const techTagsByTagId = defineQuery(
	z.object({ tagId: z.string() }),
	({ args: { tagId } }) => {
		return zql.tagToTech.where("tagId", tagId).related("tech");
	},
);

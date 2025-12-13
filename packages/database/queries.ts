import { defineQueries, defineQuery } from "@rocicorp/zero";
import { z } from "zod";
import "./types/context.ts";
import { zql } from "./zero-schema.gen.ts";

// Account queries
const myAccount = defineQuery(({ ctx: { userID } }) => {
	return zql.account.where("id", userID);
});

const allAccounts = defineQuery(() => {
	return zql.account;
});

// Tech queries
const allTech = defineQuery(() => {
	return zql.tech;
});

const techById = defineQuery(
	z.object({ id: z.string() }),
	({ args: { id } }) => {
		return zql.tech.where("id", id);
	},
);

const techWithTags = defineQuery(
	z.object({ id: z.string() }),
	({ args: { id } }) => {
		return zql.tech.where("id", id).related("tagsToTech", (q) =>
			q.related("tag"),
		);
	},
);

const searchTech = defineQuery(
	z.object({ query: z.string() }),
	({ args: { query } }) => {
		// Note: Zero uses LIKE pattern matching
		return zql.tech.where("name", "LIKE", `%${query}%`);
	},
);

// Tag queries
const allTags = defineQuery(() => {
	return zql.tag;
});

const tagById = defineQuery(
	z.object({ id: z.string() }),
	({ args: { id } }) => {
		return zql.tag.where("id", id);
	},
);

const tagWithTech = defineQuery(
	z.object({ id: z.string() }),
	({ args: { id } }) => {
		return zql.tag.where("id", id).related("tagsToTech", (q) =>
			q.related("tech"),
		);
	},
);

// TagToTech queries (junction table)
const techTagsByTechId = defineQuery(
	z.object({ techId: z.string() }),
	({ args: { techId } }) => {
		return zql.tagToTech.where("techId", techId).related("tag");
	},
);

const techTagsByTagId = defineQuery(
	z.object({ tagId: z.string() }),
	({ args: { tagId } }) => {
		return zql.tagToTech.where("tagId", tagId).related("tech");
	},
);

export const queries = defineQueries({
	account: {
		myAccount,
		allAccounts,
	},
	tech: {
		all: allTech,
		byId: techById,
		withTags: techWithTags,
		search: searchTech,
	},
	tag: {
		all: allTags,
		byId: tagById,
		withTech: tagWithTech,
	},
	tagToTech: {
		byTechId: techTagsByTechId,
		byTagId: techTagsByTagId,
	},
});

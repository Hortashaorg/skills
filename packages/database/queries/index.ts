import { defineQueries } from "@rocicorp/zero";
import "../types/context.ts";
import * as accountQueries from "./account.ts";
import * as tagQueries from "./tag.ts";
import * as tagToTechQueries from "./tag-to-tech.ts";
import * as techQueries from "./tech.ts";

export const queries = defineQueries({
	account: {
		myAccount: accountQueries.myAccount,
		allAccounts: accountQueries.allAccounts,
	},
	tech: {
		all: techQueries.allTech,
		byId: techQueries.techById,
		withTags: techQueries.techWithTags,
		search: techQueries.searchTech,
	},
	tag: {
		all: tagQueries.allTags,
		byId: tagQueries.tagById,
		withTech: tagQueries.tagWithTech,
	},
	tagToTech: {
		byTechId: tagToTechQueries.techTagsByTechId,
		byTagId: tagToTechQueries.techTagsByTagId,
	},
});

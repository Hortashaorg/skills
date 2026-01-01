import { defineQueries } from "@rocicorp/zero";
import "../types/context.ts";
import * as accountQueries from "./account.ts";
import * as channelDependenciesQueries from "./channel-dependencies.ts";
import * as packageFetchesQueries from "./package-fetches.ts";
import * as packageTagsQueries from "./package-tags.ts";
import * as packageUpvotesQueries from "./package-upvotes.ts";
import * as packagesQueries from "./packages.ts";
import * as projectsQueries from "./projects.ts";
import * as tagsQueries from "./tags.ts";

export const queries = defineQueries({
	account: {
		myAccount: accountQueries.myAccount,
		allAccounts: accountQueries.allAccounts,
	},
	packages: {
		list: packagesQueries.list,
		byId: packagesQueries.byId,
		byName: packagesQueries.byName,
		byNameWithChannels: packagesQueries.byNameWithChannels,
		byIdWithChannels: packagesQueries.byIdWithChannels,
		byIdWithTags: packagesQueries.byIdWithTags,
		recent: packagesQueries.recent,
		search: packagesQueries.search,
		failed: packagesQueries.failed,
	},
	packageFetches: {
		pending: packageFetchesQueries.pending,
		hasPending: packageFetchesQueries.hasPending,
		byId: packageFetchesQueries.byId,
		byPackageId: packageFetchesQueries.byPackageId,
		byStatus: packageFetchesQueries.byStatus,
	},
	channelDependencies: {
		byChannelId: channelDependenciesQueries.byChannelId,
	},
	tags: {
		list: tagsQueries.list,
		byId: tagsQueries.byId,
		bySlug: tagsQueries.bySlug,
		withPackages: tagsQueries.withPackages,
		all: tagsQueries.all,
		listWithCounts: tagsQueries.listWithCounts,
	},
	packageTags: {
		byPackageId: packageTagsQueries.byPackageId,
		byTagId: packageTagsQueries.byTagId,
	},
	packageUpvotes: {
		byPackage: packageUpvotesQueries.byPackage,
		byUser: packageUpvotesQueries.byUser,
	},
	projects: {
		mine: projectsQueries.mine,
		byId: projectsQueries.byId,
		list: projectsQueries.list,
	},
});

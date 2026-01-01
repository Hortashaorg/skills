import { defineQueries } from "@rocicorp/zero";
import "../types/context.ts";
import * as accountQueries from "./account.ts";
import * as channelDependenciesQueries from "./channel-dependencies.ts";
import * as packageRequestsQueries from "./package-requests.ts";
import * as packageTagsQueries from "./package-tags.ts";
import * as packageUpvotesQueries from "./package-upvotes.ts";
import * as packagesQueries from "./packages.ts";
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
	},
	packageRequests: {
		pending: packageRequestsQueries.pending,
		existingPending: packageRequestsQueries.existingPending,
		byId: packageRequestsQueries.byId,
		byStatus: packageRequestsQueries.byStatus,
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
});

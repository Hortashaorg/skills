import { defineQueries } from "@rocicorp/zero";
import "../types/context.ts";
import * as accountQueries from "./account.ts";
import * as channelDependenciesQueries from "./channel-dependencies.ts";
import * as commentsQueries from "./comments.ts";
import * as contributionEventsQueries from "./contribution-events.ts";
import * as contributionScoresQueries from "./contribution-scores.ts";
import * as ecosystemsQueries from "./ecosystems.ts";
import * as notificationsQueries from "./notifications.ts";
import * as packageFetchesQueries from "./package-fetches.ts";
import * as packageTagsQueries from "./package-tags.ts";
import * as packageUpvotesQueries from "./package-upvotes.ts";
import * as packagesQueries from "./packages.ts";
import * as projectsQueries from "./projects.ts";
import * as suggestionsQueries from "./suggestions.ts";
import * as tagsQueries from "./tags.ts";
import * as threadsQueries from "./threads.ts";

export const queries = defineQueries({
	account: {
		myAccount: accountQueries.myAccount,
		allAccounts: accountQueries.allAccounts,
		byId: accountQueries.byId,
	},
	packages: {
		list: packagesQueries.list,
		byId: packagesQueries.byId,
		byNameWithChannels: packagesQueries.byNameWithChannels,
		byIdWithChannels: packagesQueries.byIdWithChannels,
		byIdWithTags: packagesQueries.byIdWithTags,
		exactMatches: packagesQueries.exactMatches,
		recent: packagesQueries.recent,
		search: packagesQueries.search,
		failed: packagesQueries.failed,
	},
	packageFetches: {
		pending: packageFetchesQueries.pending,
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
		all: tagsQueries.all,
		listWithCounts: tagsQueries.listWithCounts,
		listWithEcosystemCounts: tagsQueries.listWithEcosystemCounts,
		search: tagsQueries.search,
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
		byAccountId: projectsQueries.byAccountId,
	},
	suggestions: {
		pendingForPackage: suggestionsQueries.pendingForPackage,
		pendingForEcosystem: suggestionsQueries.pendingForEcosystem,
		pendingCreateEcosystem: suggestionsQueries.pendingCreateEcosystem,
		pending: suggestionsQueries.pending,
		pendingExcludingUser: suggestionsQueries.pendingExcludingUser,
		byId: suggestionsQueries.byId,
	},
	contributionScores: {
		leaderboardMonthly: contributionScoresQueries.leaderboardMonthly,
		leaderboardAllTime: contributionScoresQueries.leaderboardAllTime,
		forUser: contributionScoresQueries.forUser,
	},
	contributionEvents: {
		forUser: contributionEventsQueries.forUser,
	},
	notifications: {
		mine: notificationsQueries.mine,
		unreadCount: notificationsQueries.unreadCount,
	},
	ecosystems: {
		list: ecosystemsQueries.list,
		bySlug: ecosystemsQueries.bySlug,
		byId: ecosystemsQueries.byId,
		search: ecosystemsQueries.search,
		byPackageId: ecosystemsQueries.byPackageId,
	},
	threads: {
		byId: threadsQueries.byId,
		byPackageId: threadsQueries.byPackageId,
		byEcosystemId: threadsQueries.byEcosystemId,
		byProjectId: threadsQueries.byProjectId,
	},
	comments: {
		rootsByThreadId: commentsQueries.rootsByThreadId,
		repliesByRootId: commentsQueries.repliesByRootId,
		byId: commentsQueries.byId,
		byAuthorId: commentsQueries.byAuthorId,
	},
});

import { defineMutators } from "@rocicorp/zero";
import "../types/context.ts";
import * as accountMutators from "./account.ts";
import * as commentsMutators from "./comments.ts";
import * as ecosystemPackagesMutators from "./ecosystem-packages.ts";
import * as ecosystemUpvotesMutators from "./ecosystem-upvotes.ts";
import * as ecosystemsMutators from "./ecosystems.ts";
import * as notificationsMutators from "./notifications.ts";
import * as packageUpvotesMutators from "./package-upvotes.ts";
import * as packagesMutators from "./packages.ts";
import * as projectEcosystemsMutators from "./project-ecosystems.ts";
import * as projectMembersMutators from "./project-members.ts";
import * as projectPackagesMutators from "./project-packages.ts";
import * as projectStatusesMutators from "./project-statuses.ts";
import * as projectUpvotesMutators from "./project-upvotes.ts";
import * as projectsMutators from "./projects.ts";
import * as suggestionVotesMutators from "./suggestion-votes.ts";
import * as suggestionsMutators from "./suggestions.ts";
import * as tagsMutators from "./tags.ts";

export const mutators = defineMutators({
	account: {
		updateName: accountMutators.updateName,
	},
	packages: {
		requestPackage: packagesMutators.requestPackage,
	},
	packageFetches: {},
	packageUpvotes: {
		create: packageUpvotesMutators.create,
		remove: packageUpvotesMutators.remove,
	},
	tags: {
		create: tagsMutators.create,
		update: tagsMutators.update,
		remove: tagsMutators.remove,
	},
	packageTags: {},
	projects: {
		create: projectsMutators.create,
		update: projectsMutators.update,
		remove: projectsMutators.remove,
	},
	projectPackages: {
		add: projectPackagesMutators.add,
		remove: projectPackagesMutators.remove,
		updateStatus: projectPackagesMutators.updateStatus,
	},
	suggestions: {
		create: suggestionsMutators.create,
	},
	suggestionVotes: {
		vote: suggestionVotesMutators.vote,
	},
	contributionEvents: {},
	contributionScores: {},
	notifications: {
		markRead: notificationsMutators.markRead,
		markUnread: notificationsMutators.markUnread,
		markAllRead: notificationsMutators.markAllRead,
	},
	ecosystems: {
		create: ecosystemsMutators.create,
		update: ecosystemsMutators.update,
		remove: ecosystemsMutators.remove,
	},
	ecosystemPackages: {
		add: ecosystemPackagesMutators.add,
		remove: ecosystemPackagesMutators.remove,
	},
	ecosystemUpvotes: {
		create: ecosystemUpvotesMutators.create,
		remove: ecosystemUpvotesMutators.remove,
	},
	ecosystemTags: {},
	projectEcosystems: {
		add: projectEcosystemsMutators.add,
		remove: projectEcosystemsMutators.remove,
		updateStatus: projectEcosystemsMutators.updateStatus,
	},
	projectMembers: {
		add: projectMembersMutators.add,
		remove: projectMembersMutators.remove,
	},
	projectUpvotes: {
		create: projectUpvotesMutators.create,
		remove: projectUpvotesMutators.remove,
	},
	projectStatuses: {
		add: projectStatusesMutators.add,
		remove: projectStatusesMutators.remove,
		swapPositions: projectStatusesMutators.swapPositions,
	},
	threads: {},
	comments: {
		create: commentsMutators.create,
		update: commentsMutators.update,
		remove: commentsMutators.remove,
	},
});

import { defineMutators } from "@rocicorp/zero";
import "../types/context.ts";
import * as accountMutators from "./account.ts";
import * as packageUpvotesMutators from "./package-upvotes.ts";
import * as packagesMutators from "./packages.ts";
import * as projectPackagesMutators from "./project-packages.ts";
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
	},
	suggestions: {
		createAddTag: suggestionsMutators.createAddTag,
	},
	suggestionVotes: {
		vote: suggestionVotesMutators.vote,
	},
	contributionEvents: {},
	contributionScores: {},
});

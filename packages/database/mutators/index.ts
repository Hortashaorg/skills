import { defineMutators } from "@rocicorp/zero";
import "../types/context.ts";
import * as packageTagsMutators from "./package-tags.ts";
import * as packageUpvotesMutators from "./package-upvotes.ts";
import * as packagesMutators from "./packages.ts";
import * as tagsMutators from "./tags.ts";

export const mutators = defineMutators({
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
	packageTags: {
		add: packageTagsMutators.add,
		remove: packageTagsMutators.remove,
	},
});

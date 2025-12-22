import { defineMutators } from "@rocicorp/zero";
import "../types/context.ts";
import * as packageRequestsMutators from "./package-requests.ts";
import * as packageUpvotesMutators from "./package-upvotes.ts";

export const mutators = defineMutators({
	packageRequests: {
		create: packageRequestsMutators.create,
	},
	packageUpvotes: {
		create: packageUpvotesMutators.create,
		remove: packageUpvotesMutators.remove,
	},
});

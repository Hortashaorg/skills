import { defineMutators } from "@rocicorp/zero";
import "../types/context.ts";
import * as packageDependenciesMutators from "./package-dependencies.ts";
import * as packageRequestsMutators from "./package-requests.ts";
import * as packageTagsMutators from "./package-tags.ts";
import * as packageVersionsMutators from "./package-versions.ts";
import * as packagesMutators from "./packages.ts";
import * as tagsMutators from "./tags.ts";

export const mutators = defineMutators({
	packages: {
		upsert: packagesMutators.upsert,
		updateFetchTimestamps: packagesMutators.updateFetchTimestamps,
	},
	packageRequests: {
		create: packageRequestsMutators.create,
		markFetching: packageRequestsMutators.markFetching,
		markCompleted: packageRequestsMutators.markCompleted,
		markFailed: packageRequestsMutators.markFailed,
		incrementAttempt: packageRequestsMutators.incrementAttempt,
	},
	packageVersions: {
		create: packageVersionsMutators.create,
	},
	packageDependencies: {
		create: packageDependenciesMutators.create,
		linkPackage: packageDependenciesMutators.linkPackage,
	},
	tags: {
		create: tagsMutators.create,
		update: tagsMutators.update,
		remove: tagsMutators.remove,
	},
	packageTags: {
		create: packageTagsMutators.create,
		remove: packageTagsMutators.remove,
	},
});

import { defineMutators } from "@rocicorp/zero";
import "./types/context.ts";
import * as tagMutators from "./mutators/tag.ts";
import * as tagToTechMutators from "./mutators/tag-to-tech.ts";
import * as techMutators from "./mutators/tech.ts";
import * as testMutators from "./mutators/test.ts";

export const mutators = defineMutators({
	test: {
		create: testMutators.create,
	},
	tech: {
		create: techMutators.create,
		update: techMutators.update,
		remove: techMutators.remove,
	},
	tag: {
		create: tagMutators.create,
		update: tagMutators.update,
		remove: tagMutators.remove,
	},
	tagToTech: {
		add: tagToTechMutators.add,
		remove: tagToTechMutators.remove,
	},
});

export type Mutators = typeof mutators;

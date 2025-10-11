import {
	type Mutators,
	type schema,
	useZeroRocicorp,
	type Zero,
} from "@package/database/client";

/**
 * Typed wrapper around Rocicorp's useZero hook
 * Returns a properly typed Zero instance with schema and mutators
 */
export const useZeroInstance = (): Zero<typeof schema, Mutators> => {
	return useZeroRocicorp<typeof schema, Mutators>()();
};

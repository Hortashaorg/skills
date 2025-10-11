import {
	type Mutators,
	type schema,
	useZeroRocicorp,
	type Zero,
} from "@package/database/client";

export const useZeroInstance = (): Zero<typeof schema, Mutators> => {
	return useZeroRocicorp<typeof schema, Mutators>()();
};

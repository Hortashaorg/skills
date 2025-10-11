export { Zero } from "@rocicorp/zero";
export {
	createZero,
	useQuery,
	useZero as useZeroRocicorp,
	ZeroProvider,
} from "@rocicorp/zero/solid";
export { createMutators, type Mutators } from "./mutators.ts";
export { type Schema, schema } from "./schema.ts";
export { decodeAuthData } from "./utils.ts";

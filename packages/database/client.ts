export { Zero } from "@rocicorp/zero";
export {
	createZero,
	useConnectionState,
	useQuery,
	useZero,
	ZeroProvider,
} from "@rocicorp/zero/solid";
export { type Mutators, mutators } from "./mutators/index.ts";
export { queries } from "./queries/index.ts";
export { decodeAuthData } from "./utils.ts";
export { type Schema, schema, zql } from "./zero-schema.gen.ts";

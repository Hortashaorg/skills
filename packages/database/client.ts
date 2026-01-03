export type { Row } from "@rocicorp/zero";
export {
	useConnectionState,
	useQuery,
	useZero,
	ZeroProvider,
} from "@rocicorp/zero/solid";
// Re-export inferred types from schema
export type {
	ContributionEventType,
	DependencyType,
	FetchStatus,
	PackageStatus,
	Registry,
	SuggestionStatus,
	SuggestionType,
	Vote,
} from "./db/types.ts";
export { enums } from "./db/types.ts";
export { mutators } from "./mutators/index.ts";
export { queries } from "./queries/index.ts";
// Suggestion display helpers (frontend-safe)
export {
	formatSuggestionAction,
	formatSuggestionDescription,
	getSuggestionTypeLabel,
} from "./suggestions/display.ts";
export { schema } from "./zero-schema.gen.ts";

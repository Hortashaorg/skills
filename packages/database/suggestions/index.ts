/**
 * Suggestion System
 *
 * Adding a new suggestion type:
 * 1. Add enum value to db/schema/enums.ts
 * 2. Create type definition in suggestions/types/
 * 3. Export from suggestions/types/index.ts
 */

export {
	type FormatContext,
	formatSuggestionAction,
	formatSuggestionDescription,
	getSuggestionTypeLabel,
	suggestionTypeMeta,
} from "./display.ts";
export { isPowerUser, type PowerUserRole } from "./power-user.ts";
export {
	type ResolutionContext,
	resolveApprovedSuggestion,
} from "./resolution.ts";
export {
	defineSuggestionType,
	getSuggestionType,
	isValidSuggestionType,
	type SuggestionTypeDefinition,
	type SuggestionTypeKey,
	suggestionTypeKeys,
	suggestionTypes,
} from "./types/index.ts";

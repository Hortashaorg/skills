/**
 * Suggestion Type Registry
 *
 * Central configuration for suggestion types. When adding a new suggestion type:
 * 1. Add to db/schema/enums.ts (suggestionTypeEnum)
 * 2. Add versioned payload schema in schemas.ts
 * 3. Add type metadata in display.ts
 * 4. Add resolution handler in resolution.ts
 */

// Display helpers (frontend-safe)
export {
	formatSuggestionAction,
	formatSuggestionDescription,
	getSuggestionTypeLabel,
	suggestionTypeMeta,
} from "./display.ts";
// Power user helpers
export { isPowerUser, type PowerUserRole } from "./power-user.ts";
// Resolution handlers (backend only)
export {
	type ResolutionContext,
	resolutionHandlers,
	resolveApprovedSuggestion,
} from "./resolution.ts";
// Schemas and validation
export {
	type AddTagPayload,
	currentPayloadVersion,
	getPayloadSchema,
	parsePayload,
	suggestionPayloads,
} from "./schemas.ts";

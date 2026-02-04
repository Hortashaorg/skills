// Pagination & Loading
// Values must be divisible by 6 (works for both 2-column and 3-column grids)
export const SEARCH_INITIAL_LIMIT = 24;
export const SEARCH_LOAD_MORE_COUNT = 24;
export const SEARCH_AUTO_LOAD_LIMIT = 240;

// Dropdown search limit (for search inputs in popovers, etc.)
export const SEARCH_DROPDOWN_LIMIT = 10;

// Leaderboard
export const LEADERBOARD_LIMIT = 50;
export const LEADERBOARD_PREVIEW_LIMIT = 5;

// Comments
export const MAX_REPLIES_PER_THREAD = 100;
export { MAX_COMMENT_LENGTH } from "@package/common";

// Infinite Scroll
export const INFINITE_SCROLL_DEBOUNCE_MS = 100;
export const INFINITE_SCROLL_ROOT_MARGIN = "200px";
export const BACK_TO_TOP_SCROLL_THRESHOLD = 800;

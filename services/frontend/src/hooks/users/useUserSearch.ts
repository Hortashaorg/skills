import type { Row } from "@package/database/client";
import { queries, useQuery } from "@package/database/client";
import {
	type Accessor,
	batch,
	createEffect,
	createSignal,
	on,
	untrack,
} from "solid-js";
import { SEARCH_INITIAL_LIMIT, SEARCH_LOAD_MORE_COUNT } from "@/lib/constants";

export type User = Row["account"] & {
	contributionScore?: Row["contributionScores"];
};

// For score-based queries, the shape is different (contributionScores with related account)
export type UserWithScore = Row["contributionScores"] & {
	account?: Row["account"];
};

export type SortBy = "monthlyScore" | "allTimeScore" | "createdAt";

export interface UseUserSearchOptions {
	/** Show recent users when no search query is entered */
	showRecentWhenEmpty: boolean;
	/** Sort order for results */
	sortBy: SortBy;
}

export interface UseUserSearchResult {
	// State
	query: Accessor<string>;

	// Results - normalized to User type regardless of sortBy
	results: Accessor<readonly User[]>;
	exactMatch: Accessor<User | null>;
	isLoading: Accessor<boolean>;

	// Pagination
	canLoadMore: Accessor<boolean>;
	loadMore: () => void;

	// Actions
	setQuery: (value: string) => void;
}

// Normalize UserWithScore to User format
const normalizeScoreResult = (item: UserWithScore): User | null => {
	if (!item.account) return null;
	return {
		...item.account,
		contributionScore: {
			id: item.id,
			accountId: item.accountId,
			monthlyScore: item.monthlyScore,
			allTimeScore: item.allTimeScore,
			lastCalculatedAt: item.lastCalculatedAt,
		},
	};
};

/**
 * Hook for searching users.
 *
 * Handles:
 * - Zero queries for search and exact match
 * - Configurable sort order (monthlyScore, allTimeScore, createdAt)
 * - Exact match floated to top (deduplicated from results)
 * - Result stabilization to prevent flicker
 * - Pagination with load more
 * - Optional recent users fallback when no search query
 *
 * @example Users browse page (sorted by join date):
 * ```tsx
 * const search = useUserSearch({ showRecentWhenEmpty: true, sortBy: 'createdAt' });
 * ```
 *
 * @example Leaderboard with search (sorted by monthly score):
 * ```tsx
 * const search = useUserSearch({ showRecentWhenEmpty: true, sortBy: 'monthlyScore' });
 *
 * <Input value={search.query()} onInput={e => search.setQuery(e.target.value)} />
 * <For each={search.results()}>{user => <LeaderboardRow user={user} />}</For>
 * ```
 */
export function useUserSearch(
	options: UseUserSearchOptions,
): UseUserSearchResult {
	const { showRecentWhenEmpty, sortBy } = options;

	// ─────────────────────────────────────────────────────────────────────────
	// State
	// ─────────────────────────────────────────────────────────────────────────

	const [query, setQuery] = createSignal("");
	const [limit, setLimit] = createSignal(SEARCH_INITIAL_LIMIT);

	// ─────────────────────────────────────────────────────────────────────────
	// Derived state
	// ─────────────────────────────────────────────────────────────────────────

	const searchTerm = () => query().trim();
	const hasSearchTerm = () => searchTerm().length > 0;
	const isSortByScore = () =>
		sortBy === "monthlyScore" || sortBy === "allTimeScore";

	// ─────────────────────────────────────────────────────────────────────────
	// Queries - Account-based (for createdAt sorting)
	// ─────────────────────────────────────────────────────────────────────────

	// Recent users when no search (ordered by createdAt)
	const [recentUsers, recentResult] = useQuery(() =>
		showRecentWhenEmpty && !hasSearchTerm() && sortBy === "createdAt"
			? queries.account.recent({ limit: limit() })
			: null,
	);

	// Exact match by name (account-based)
	const [exactMatchAccount, exactMatchAccountStatus] = useQuery(() =>
		hasSearchTerm() && sortBy === "createdAt"
			? queries.account.exactMatch({ name: searchTerm() })
			: null,
	);

	// Search results (account-based, sorted by createdAt)
	const [searchResultsAccount, searchResultAccount] = useQuery(() =>
		hasSearchTerm() && sortBy === "createdAt"
			? queries.account.search({
					query: searchTerm(),
					limit: limit() + 8,
				})
			: null,
	);

	// ─────────────────────────────────────────────────────────────────────────
	// Queries - Score-based (for monthlyScore/allTimeScore sorting)
	// ─────────────────────────────────────────────────────────────────────────

	// Recent users by score when no search
	const [recentByMonthly, recentByMonthlyResult] = useQuery(() =>
		showRecentWhenEmpty && !hasSearchTerm() && sortBy === "monthlyScore"
			? queries.contributionScores.searchByMonthlyScore({ limit: limit() })
			: null,
	);

	const [recentByAllTime, recentByAllTimeResult] = useQuery(() =>
		showRecentWhenEmpty && !hasSearchTerm() && sortBy === "allTimeScore"
			? queries.contributionScores.searchByAllTimeScore({ limit: limit() })
			: null,
	);

	// Exact match by name (score-based)
	const [exactMatchScore, exactMatchScoreStatus] = useQuery(() =>
		hasSearchTerm() && isSortByScore()
			? queries.contributionScores.exactMatchByName({ name: searchTerm() })
			: null,
	);

	// Search results (score-based)
	const [searchByMonthly, searchByMonthlyResult] = useQuery(() =>
		hasSearchTerm() && sortBy === "monthlyScore"
			? queries.contributionScores.searchByMonthlyScore({
					query: searchTerm(),
					limit: limit() + 8,
				})
			: null,
	);

	const [searchByAllTime, searchByAllTimeResult] = useQuery(() =>
		hasSearchTerm() && sortBy === "allTimeScore"
			? queries.contributionScores.searchByAllTimeScore({
					query: searchTerm(),
					limit: limit() + 8,
				})
			: null,
	);

	// ─────────────────────────────────────────────────────────────────────────
	// Query completion
	// ─────────────────────────────────────────────────────────────────────────

	const allQueriesComplete = () => {
		if (!hasSearchTerm()) {
			if (!showRecentWhenEmpty) return true;
			if (sortBy === "createdAt") return recentResult().type === "complete";
			if (sortBy === "monthlyScore")
				return recentByMonthlyResult().type === "complete";
			if (sortBy === "allTimeScore")
				return recentByAllTimeResult().type === "complete";
			return true;
		}

		if (sortBy === "createdAt") {
			return (
				searchResultAccount().type === "complete" &&
				exactMatchAccountStatus().type === "complete"
			);
		}

		if (sortBy === "monthlyScore") {
			return (
				searchByMonthlyResult().type === "complete" &&
				exactMatchScoreStatus().type === "complete"
			);
		}

		if (sortBy === "allTimeScore") {
			return (
				searchByAllTimeResult().type === "complete" &&
				exactMatchScoreStatus().type === "complete"
			);
		}

		return true;
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Result processing
	// ─────────────────────────────────────────────────────────────────────────

	// Get raw results based on sortBy
	const getRawResults = (): readonly User[] => {
		if (!hasSearchTerm()) {
			if (sortBy === "createdAt") {
				return (recentUsers() ?? []) as readonly User[];
			}
			if (sortBy === "monthlyScore") {
				return (recentByMonthly() ?? [])
					.map(normalizeScoreResult)
					.filter((u): u is User => u !== null);
			}
			if (sortBy === "allTimeScore") {
				return (recentByAllTime() ?? [])
					.map(normalizeScoreResult)
					.filter((u): u is User => u !== null);
			}
		}

		if (sortBy === "createdAt") {
			return (searchResultsAccount() ?? []) as readonly User[];
		}
		if (sortBy === "monthlyScore") {
			return (searchByMonthly() ?? [])
				.map(normalizeScoreResult)
				.filter((u): u is User => u !== null);
		}
		if (sortBy === "allTimeScore") {
			return (searchByAllTime() ?? [])
				.map(normalizeScoreResult)
				.filter((u): u is User => u !== null);
		}

		return [];
	};

	// Get exact match based on sortBy
	const getRawExactMatch = (): User | null => {
		if (!hasSearchTerm()) return null;

		if (sortBy === "createdAt") {
			const results = exactMatchAccount();
			return (results?.[0] as User | undefined) ?? null;
		}

		// For score-based, use the score query result
		const results = exactMatchScore();
		if (!results?.[0]) return null;
		return normalizeScoreResult(results[0]);
	};

	// Filter out exact match from results and trim to limit
	const getDisplayUsers = (
		results: readonly User[],
		exactMatch: User | null,
	): User[] => {
		const exactId = exactMatch?.id;
		const others = exactId
			? results.filter((u) => u.id !== exactId)
			: [...results];

		// Trim to limit (accounting for exact match taking a slot)
		const exactCount = exactMatch ? 1 : 0;
		const targetOthers = Math.max(0, limit() - exactCount);
		return others.slice(0, targetOthers);
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Stabilization (prevents flicker during re-sync)
	// ─────────────────────────────────────────────────────────────────────────

	const [stableResults, setStableResults] = createSignal<readonly User[]>([]);
	const [stableExactMatch, setStableExactMatch] = createSignal<User | null>(
		null,
	);
	const [stableCanLoadMore, setStableCanLoadMore] = createSignal(false);

	// Track filter state for stabilization
	const [lastFilterKey, setLastFilterKey] = createSignal("");
	const [lastLimit, setLastLimit] = createSignal(SEARCH_INITIAL_LIMIT);
	const currentFilterKey = () => query();

	// Stabilize order: keep existing order, append new items
	const stabilizeResults = (
		newItems: readonly User[],
		oldItems: readonly User[],
		filtersChanged: boolean,
	): User[] => {
		if (filtersChanged || oldItems.length === 0) {
			return [...newItems];
		}

		const oldIds = new Set(oldItems.map((u) => u.id));
		const newById = new Map(newItems.map((u) => [u.id, u]));

		const result: User[] = [];
		for (const old of oldItems) {
			const updated = newById.get(old.id);
			if (updated) {
				result.push(updated);
			}
		}

		for (const item of newItems) {
			if (!oldIds.has(item.id)) {
				result.push(item);
			}
		}

		return result;
	};

	// Check if we can load more
	const canLoadMore = () => {
		const raw = getRawResults();
		if (!hasSearchTerm()) {
			if (!showRecentWhenEmpty) return false;
			return raw.length >= limit();
		}
		return raw.length >= limit() + 8;
	};

	// Update stable snapshots when queries complete
	createEffect(() => {
		if (!allQueriesComplete()) return;

		const filterKey = currentFilterKey();
		const oldFilterKey = untrack(() => lastFilterKey());
		const filtersChanged = filterKey !== oldFilterKey;

		// Detect load-more action
		const currentLimit = limit();
		const prevLimit = untrack(() => lastLimit());
		const isLoadMore = !filtersChanged && currentLimit > prevLimit;

		const rawResults = getRawResults();
		const exactMatch = getRawExactMatch();
		const users = hasSearchTerm()
			? getDisplayUsers(rawResults, exactMatch)
			: [...rawResults];

		const loadMoreAvailable = canLoadMore();
		const oldResults = untrack(() => stableResults());

		// Block shorter results during load-more (prevents flicker)
		if (isLoadMore && users.length < oldResults.length) {
			return;
		}

		const stabilized = stabilizeResults(users, oldResults, filtersChanged);

		batch(() => {
			setStableResults(stabilized);
			setStableExactMatch(exactMatch);
			setStableCanLoadMore(loadMoreAvailable);
			if (filtersChanged) {
				setLastFilterKey(filterKey);
			}
			setLastLimit(currentLimit);
		});
	});

	// Reset limit on filter change
	createEffect(
		on([query], () => {
			setLimit(SEARCH_INITIAL_LIMIT);
		}),
	);

	// ─────────────────────────────────────────────────────────────────────────
	// Loading state
	// ─────────────────────────────────────────────────────────────────────────

	const [hasEverLoaded, setHasEverLoaded] = createSignal(false);

	createEffect(() => {
		if (allQueriesComplete() && !hasEverLoaded()) {
			setHasEverLoaded(true);
		}
	});

	const isLoading = () => !hasEverLoaded() && !allQueriesComplete();

	// ─────────────────────────────────────────────────────────────────────────
	// Actions
	// ─────────────────────────────────────────────────────────────────────────

	const loadMore = () => {
		setLimit((prev) => prev + SEARCH_LOAD_MORE_COUNT);
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Return
	// ─────────────────────────────────────────────────────────────────────────

	return {
		// State
		query,

		// Results
		results: stableResults,
		exactMatch: stableExactMatch,
		isLoading,

		// Pagination
		canLoadMore: stableCanLoadMore,
		loadMore,

		// Actions
		setQuery,
	};
}

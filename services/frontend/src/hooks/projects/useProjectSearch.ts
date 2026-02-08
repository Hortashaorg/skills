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

export type Project = Row["projects"] & {
	account?: Row["account"];
	projectPackages?: readonly Row["projectPackages"][];
	upvotes?: readonly Row["projectUpvotes"][];
};

export interface UseProjectSearchOptions {
	/** Show recent projects when no search query is entered */
	showRecentWhenEmpty: boolean;
}

export interface UseProjectSearchResult {
	// State
	query: Accessor<string>;

	// Results
	results: Accessor<readonly Project[]>;
	exactMatch: Accessor<Project | null>;
	isLoading: Accessor<boolean>;

	// Pagination
	canLoadMore: Accessor<boolean>;
	loadMore: () => void;

	// Actions
	setQuery: (value: string) => void;
}

/**
 * Hook for searching projects.
 *
 * Handles:
 * - Zero queries for search and exact match
 * - Exact match floated to top (deduplicated from results)
 * - Result stabilization to prevent flicker
 * - Pagination with load more
 * - Optional recent projects fallback when no search query
 *
 * @example Projects browse page (with recent fallback):
 * ```tsx
 * const search = useProjectSearch({ showRecentWhenEmpty: true });
 *
 * <Input
 *   value={search.query()}
 *   onInput={e => search.setQuery(e.target.value)}
 * />
 * <Show when={search.exactMatch()}>
 *   {proj => <ProjectCard {...proj()} />}
 * </Show>
 * <For each={search.results()}>{proj => <ProjectCard {...proj} />}</For>
 *
 * <Show when={search.canLoadMore()}>
 *   <Button onClick={search.loadMore}>Load more</Button>
 * </Show>
 * ```
 */
export function useProjectSearch(
	options: UseProjectSearchOptions,
): UseProjectSearchResult {
	const { showRecentWhenEmpty } = options;

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

	// ─────────────────────────────────────────────────────────────────────────
	// Queries
	// ─────────────────────────────────────────────────────────────────────────

	// Recent projects when no search (ordered by updatedAt)
	const [recentProjects, recentResult] = useQuery(() =>
		showRecentWhenEmpty && !hasSearchTerm()
			? queries.projects.recent({ limit: limit() })
			: null,
	);

	// Exact match (name === searchTerm)
	const [exactMatchResult, exactMatchStatus] = useQuery(() =>
		hasSearchTerm()
			? queries.projects.exactMatch({ name: searchTerm() })
			: null,
	);

	// Search results (partial matches)
	// Over-fetch slightly for exact match deduplication + stabilization
	const [searchResults, searchResult] = useQuery(() =>
		hasSearchTerm()
			? queries.projects.search({
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
			return recentResult().type === "complete";
		}
		return (
			searchResult().type === "complete" &&
			exactMatchStatus().type === "complete"
		);
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Result processing
	// ─────────────────────────────────────────────────────────────────────────

	// Filter out exact match from search results and trim to limit
	const getDisplayProjects = (
		results: readonly Project[],
		exactMatch: Project | null,
	): Project[] => {
		const exactId = exactMatch?.id;
		const others = exactId
			? results.filter((p) => p.id !== exactId)
			: [...results];

		// Trim to limit (accounting for exact match taking a slot)
		const exactCount = exactMatch ? 1 : 0;
		const targetOthers = Math.max(0, limit() - exactCount);
		return others.slice(0, targetOthers);
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Stabilization (prevents flicker during re-sync)
	// ─────────────────────────────────────────────────────────────────────────

	const [stableResults, setStableResults] = createSignal<readonly Project[]>(
		[],
	);
	const [stableExactMatch, setStableExactMatch] = createSignal<Project | null>(
		null,
	);
	const [stableCanLoadMore, setStableCanLoadMore] = createSignal(false);

	// Track filter state for stabilization
	const [lastFilterKey, setLastFilterKey] = createSignal("");
	const [lastLimit, setLastLimit] = createSignal(SEARCH_INITIAL_LIMIT);
	const currentFilterKey = () => query();

	// Stabilize order: keep existing order, append new items
	const stabilizeResults = (
		newItems: readonly Project[],
		oldItems: readonly Project[],
		filtersChanged: boolean,
	): Project[] => {
		if (filtersChanged || oldItems.length === 0) {
			return [...newItems];
		}

		const oldIds = new Set(oldItems.map((p) => p.id));
		const newById = new Map(newItems.map((p) => [p.id, p]));

		const result: Project[] = [];
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
		if (!hasSearchTerm()) {
			if (!showRecentWhenEmpty) return false;
			return (recentProjects()?.length ?? 0) >= limit();
		}
		return (searchResults()?.length ?? 0) >= limit() + 8;
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

		let projects: readonly Project[];
		let exactMatch: Project | null = null;

		if (!hasSearchTerm()) {
			projects = recentProjects() ?? [];
		} else {
			// Get exact match (query returns array, take first)
			const exactResults = exactMatchResult();
			exactMatch = exactResults?.[0] ?? null;

			const results = searchResults() ?? [];
			projects = getDisplayProjects(results, exactMatch);
		}

		const loadMoreAvailable = canLoadMore();
		const oldResults = untrack(() => stableResults());

		// Block shorter results during load-more (prevents flicker)
		if (isLoadMore && projects.length < oldResults.length) {
			return;
		}

		const stabilized = stabilizeResults(projects, oldResults, filtersChanged);

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

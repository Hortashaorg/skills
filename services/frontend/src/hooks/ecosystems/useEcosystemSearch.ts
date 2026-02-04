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

type EcosystemTag = Row["ecosystemTags"] & {
	tag?: Row["tags"];
};

export type Ecosystem = Row["ecosystems"] & {
	upvotes?: readonly Row["ecosystemUpvotes"][];
	ecosystemPackages?: readonly Row["ecosystemPackages"][];
	ecosystemTags?: readonly EcosystemTag[];
};

export interface UseEcosystemSearchOptions {
	/** Show recent ecosystems when no search query is entered */
	showRecentWhenEmpty: boolean;
}

export interface UseEcosystemSearchResult {
	// State
	query: Accessor<string>;
	tags: Accessor<string[]>;

	// Results
	results: Accessor<readonly Ecosystem[]>;
	exactMatch: Accessor<Ecosystem | null>;
	isLoading: Accessor<boolean>;

	// Pagination
	canLoadMore: Accessor<boolean>;
	loadMore: () => void;

	// Actions
	setQuery: (value: string) => void;
	setTags: (slugs: string[]) => void;
}

/**
 * Hook for searching ecosystems.
 *
 * Handles:
 * - Zero queries for search and exact match
 * - Exact match floated to top (deduplicated from results)
 * - Result stabilization to prevent flicker
 * - Pagination with load more
 * - Optional recent ecosystems fallback when no search query
 *
 * @example Ecosystems browse page (with recent fallback):
 * ```tsx
 * const search = useEcosystemSearch({ showRecentWhenEmpty: true });
 *
 * <Input
 *   value={search.query()}
 *   onInput={e => search.setQuery(e.target.value)}
 * />
 * <Show when={search.exactMatch()}>
 *   {eco => <EcosystemCard {...eco()} />}
 * </Show>
 * <For each={search.results()}>{eco => <EcosystemCard {...eco} />}</For>
 *
 * <Show when={search.canLoadMore()}>
 *   <Button onClick={search.loadMore}>Load more</Button>
 * </Show>
 * ```
 *
 * @example Project detail page (search only):
 * ```tsx
 * const search = useEcosystemSearch({ showRecentWhenEmpty: false });
 *
 * <Input value={search.query()} onInput={e => search.setQuery(e.target.value)} />
 * <For each={search.results()}>{eco => <EcosystemCard {...eco} />}</For>
 * ```
 */
export function useEcosystemSearch(
	options: UseEcosystemSearchOptions,
): UseEcosystemSearchResult {
	const { showRecentWhenEmpty } = options;

	// ─────────────────────────────────────────────────────────────────────────
	// State
	// ─────────────────────────────────────────────────────────────────────────

	const [query, setQuery] = createSignal("");
	const [tags, setTags] = createSignal<string[]>([]);
	const [limit, setLimit] = createSignal(SEARCH_INITIAL_LIMIT);

	// ─────────────────────────────────────────────────────────────────────────
	// Derived state
	// ─────────────────────────────────────────────────────────────────────────

	const searchTerm = () => query().trim();
	const hasSearchTerm = () => searchTerm().length > 0;
	const hasActiveFilters = () => hasSearchTerm() || tags().length > 0;

	// ─────────────────────────────────────────────────────────────────────────
	// Queries
	// ─────────────────────────────────────────────────────────────────────────

	// Recent ecosystems when no filters (ordered by updatedAt)
	const [recentEcosystems, recentResult] = useQuery(() =>
		showRecentWhenEmpty && !hasActiveFilters()
			? queries.ecosystems.recent({ limit: limit() })
			: null,
	);

	// Exact match (name === searchTerm)
	const [exactMatchResult, exactMatchStatus] = useQuery(() =>
		hasSearchTerm()
			? queries.ecosystems.exactMatch({ name: searchTerm() })
			: null,
	);

	// Search results (partial matches)
	// Over-fetch slightly for exact match deduplication + stabilization
	const [searchResults, searchResult] = useQuery(() =>
		hasActiveFilters()
			? queries.ecosystems.search({
					query: searchTerm() || undefined,
					tagSlugs: tags().length > 0 ? tags() : undefined,
					limit: limit() + 8,
				})
			: null,
	);

	// ─────────────────────────────────────────────────────────────────────────
	// Query completion
	// ─────────────────────────────────────────────────────────────────────────

	const allQueriesComplete = () => {
		if (!hasActiveFilters()) {
			if (!showRecentWhenEmpty) return true;
			return recentResult().type === "complete";
		}
		return (
			searchResult().type === "complete" &&
			(!hasSearchTerm() || exactMatchStatus().type === "complete")
		);
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Result processing
	// ─────────────────────────────────────────────────────────────────────────

	// Filter out exact match from search results and trim to limit
	const getDisplayEcosystems = (
		results: readonly Ecosystem[],
		exactMatch: Ecosystem | null,
	): Ecosystem[] => {
		const exactId = exactMatch?.id;
		const others = exactId
			? results.filter((e) => e.id !== exactId)
			: [...results];

		// Trim to limit (accounting for exact match taking a slot)
		const exactCount = exactMatch ? 1 : 0;
		const targetOthers = Math.max(0, limit() - exactCount);
		return others.slice(0, targetOthers);
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Stabilization (prevents flicker during re-sync)
	// ─────────────────────────────────────────────────────────────────────────

	const [stableResults, setStableResults] = createSignal<readonly Ecosystem[]>(
		[],
	);
	const [stableExactMatch, setStableExactMatch] =
		createSignal<Ecosystem | null>(null);
	const [stableCanLoadMore, setStableCanLoadMore] = createSignal(false);

	// Track filter state for stabilization
	const [lastFilterKey, setLastFilterKey] = createSignal("");
	const [lastLimit, setLastLimit] = createSignal(SEARCH_INITIAL_LIMIT);
	const currentFilterKey = () => `${query()}|${tags().join(",")}`;

	// Stabilize order: keep existing order, append new items
	const stabilizeResults = (
		newItems: readonly Ecosystem[],
		oldItems: readonly Ecosystem[],
		filtersChanged: boolean,
	): Ecosystem[] => {
		if (filtersChanged || oldItems.length === 0) {
			return [...newItems];
		}

		const oldIds = new Set(oldItems.map((e) => e.id));
		const newById = new Map(newItems.map((e) => [e.id, e]));

		const result: Ecosystem[] = [];
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
		if (!hasActiveFilters()) {
			if (!showRecentWhenEmpty) return false;
			return (recentEcosystems()?.length ?? 0) >= limit();
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

		let ecosystems: readonly Ecosystem[];
		let exactMatch: Ecosystem | null = null;

		if (!hasActiveFilters()) {
			ecosystems = recentEcosystems() ?? [];
		} else {
			// Get exact match (query returns array, take first)
			const exactResults = exactMatchResult();
			exactMatch =
				hasSearchTerm() && exactResults?.[0] ? exactResults[0] : null;

			const results = searchResults() ?? [];
			ecosystems = getDisplayEcosystems(results, exactMatch);
		}

		const loadMoreAvailable = canLoadMore();
		const oldResults = untrack(() => stableResults());

		// Block shorter results during load-more (prevents flicker)
		if (isLoadMore && ecosystems.length < oldResults.length) {
			return;
		}

		const stabilized = stabilizeResults(ecosystems, oldResults, filtersChanged);

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
		on([query, tags], () => {
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
		tags,

		// Results
		results: stableResults,
		exactMatch: stableExactMatch,
		isLoading,

		// Pagination
		canLoadMore: stableCanLoadMore,
		loadMore,

		// Actions
		setQuery,
		setTags,
	};
}

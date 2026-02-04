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
import type { Registry, RegistryFilter } from "@/lib/registries";

type PackageTag = Row["packageTags"] & {
	tag?: Row["tags"];
};

export type Package = Row["packages"] & {
	upvotes?: readonly Row["packageUpvotes"][];
	packageTags?: readonly PackageTag[];
};

export interface UsePackageSearchOptions {
	/** Show recent packages when no search query is entered */
	showRecentWhenEmpty: boolean;
}

export interface UsePackageSearchResult {
	// State
	query: Accessor<string>;
	registry: Accessor<RegistryFilter>;
	tags: Accessor<string[]>;

	// Results
	results: Accessor<readonly Package[]>;
	exactMatches: Accessor<readonly Package[]>;
	isLoading: Accessor<boolean>;

	// Pagination
	canLoadMore: Accessor<boolean>;
	loadMore: () => void;

	// Actions
	setQuery: (value: string) => void;
	setRegistry: (value: RegistryFilter) => void;
	setTags: (slugs: string[]) => void;
}

/**
 * Hook for searching packages.
 *
 * Handles:
 * - Zero queries for search and exact matches
 * - Exact match deduplication from search results
 * - Result stabilization to prevent flicker
 * - Pagination with load more
 * - Optional recent packages fallback when no search query
 *
 * @example Project detail page (search only):
 * ```tsx
 * const search = usePackageSearch({ showRecentWhenEmpty: false });
 *
 * <Input
 *   value={search.query()}
 *   onInput={e => search.setQuery(e.target.value)}
 * />
 * <For each={search.results()}>{pkg => <PackageCard {...pkg} />}</For>
 * ```
 *
 * @example Browse page (with recent packages fallback):
 * ```tsx
 * const search = usePackageSearch({ showRecentWhenEmpty: true });
 *
 * // Sync to URL if needed (page's concern)
 * createEffect(() => setSearchParams({ q: search.query() }));
 *
 * <Input value={search.query()} onInput={e => search.setQuery(e.target.value)} />
 * <For each={search.results()}>{pkg => <PackageCard {...pkg} />}</For>
 *
 * <Show when={search.canLoadMore()}>
 *   <Button onClick={search.loadMore}>Load more</Button>
 * </Show>
 * ```
 */
export function usePackageSearch(
	options: UsePackageSearchOptions,
): UsePackageSearchResult {
	const { showRecentWhenEmpty } = options;

	// ─────────────────────────────────────────────────────────────────────────
	// State
	// ─────────────────────────────────────────────────────────────────────────

	const [query, setQuery] = createSignal("");
	const [registry, setRegistry] = createSignal<RegistryFilter>("all");
	const [tags, setTags] = createSignal<string[]>([]);
	const [limit, setLimit] = createSignal(SEARCH_INITIAL_LIMIT);

	// ─────────────────────────────────────────────────────────────────────────
	// Derived state
	// ─────────────────────────────────────────────────────────────────────────

	const searchTerm = () => query().trim();
	const hasSearchTerm = () => searchTerm().length > 0;
	const hasActiveFilters = () =>
		hasSearchTerm() || registry() !== "all" || tags().length > 0;

	const effectiveRegistry = (): Registry | undefined =>
		registry() !== "all" ? (registry() as Registry) : undefined;

	// ─────────────────────────────────────────────────────────────────────────
	// Queries
	// ─────────────────────────────────────────────────────────────────────────

	// Recent packages when no filters
	const [recentPackages, recentResult] = useQuery(() =>
		showRecentWhenEmpty && !hasActiveFilters()
			? queries.packages.recent({ limit: limit() })
			: null,
	);

	// Exact matches (name === searchTerm)
	const [exactMatchResults, exactMatchResult] = useQuery(() =>
		hasSearchTerm()
			? queries.packages.exactMatches({
					name: searchTerm(),
					registry: effectiveRegistry(),
				})
			: null,
	);

	// Search results (partial matches)
	// Over-fetch slightly for exact match deduplication + grid evening
	const [searchResults, searchResult] = useQuery(() =>
		hasActiveFilters()
			? queries.packages.search({
					query: searchTerm() || undefined,
					registry: effectiveRegistry(),
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
			(!hasSearchTerm() || exactMatchResult().type === "complete")
		);
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Result processing
	// ─────────────────────────────────────────────────────────────────────────

	// Filter out exact matches from search results and trim to limit
	const getDisplayPackages = (
		results: readonly Package[],
		exactMatches: readonly Package[],
	): Package[] => {
		const exactIds = new Set(exactMatches.map((p) => p.id));
		const others = results.filter((p) => !exactIds.has(p.id));

		// Trim to limit (accounting for exact matches taking slots)
		const targetOthers = Math.max(0, limit() - exactMatches.length);
		return others.slice(0, targetOthers);
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Stabilization (prevents flicker during re-sync)
	// ─────────────────────────────────────────────────────────────────────────

	const [stableResults, setStableResults] = createSignal<readonly Package[]>(
		[],
	);
	const [stableExactMatches, setStableExactMatches] = createSignal<
		readonly Package[]
	>([]);
	const [stableCanLoadMore, setStableCanLoadMore] = createSignal(false);

	// Track filter state for stabilization
	const [lastFilterKey, setLastFilterKey] = createSignal("");
	const [lastLimit, setLastLimit] = createSignal(SEARCH_INITIAL_LIMIT);
	const currentFilterKey = () => `${query()}|${registry()}|${tags().join(",")}`;

	// Stabilize package order: keep existing order, append new items
	const stabilizePackages = (
		newPkgs: readonly Package[],
		oldPkgs: readonly Package[],
		filtersChanged: boolean,
	): Package[] => {
		if (filtersChanged || oldPkgs.length === 0) {
			return [...newPkgs];
		}

		const oldIds = new Set(oldPkgs.map((p) => p.id));
		const newById = new Map(newPkgs.map((p) => [p.id, p]));

		const result: Package[] = [];
		for (const old of oldPkgs) {
			const updated = newById.get(old.id);
			if (updated) {
				result.push(updated);
			}
		}

		for (const pkg of newPkgs) {
			if (!oldIds.has(pkg.id)) {
				result.push(pkg);
			}
		}

		return result;
	};

	// Check if we can load more
	const canLoadMore = () => {
		if (!hasActiveFilters()) {
			if (!showRecentWhenEmpty) return false;
			return (recentPackages()?.length ?? 0) >= limit();
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

		let packages: readonly Package[];
		let exactMatches: readonly Package[] = [];

		if (!hasActiveFilters()) {
			packages = recentPackages() ?? [];
		} else {
			exactMatches = hasSearchTerm() ? (exactMatchResults() ?? []) : [];
			const results = searchResults() ?? [];
			packages = getDisplayPackages(results, exactMatches);
		}

		const loadMoreAvailable = canLoadMore();
		const oldPackages = untrack(() => stableResults());

		// Block shorter results during load-more (prevents flicker)
		if (isLoadMore && packages.length < oldPackages.length) {
			return;
		}

		const stabilized = stabilizePackages(packages, oldPackages, filtersChanged);

		batch(() => {
			setStableResults(stabilized);
			setStableExactMatches([...exactMatches]);
			setStableCanLoadMore(loadMoreAvailable);
			if (filtersChanged) {
				setLastFilterKey(filterKey);
			}
			setLastLimit(currentLimit);
		});
	});

	// Reset limit on filter change
	createEffect(
		on([query, registry, tags], () => {
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
		registry,
		tags,

		// Results
		results: stableResults,
		exactMatches: stableExactMatches,
		isLoading,

		// Pagination
		canLoadMore: stableCanLoadMore,
		loadMore,

		// Actions
		setQuery,
		setRegistry,
		setTags,
	};
}

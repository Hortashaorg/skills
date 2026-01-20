import { queries, useQuery } from "@package/database/client";
import {
	batch,
	createEffect,
	createMemo,
	createSignal,
	on,
	untrack,
} from "solid-js";
import type { FilterOption } from "@/components/composite/entity-filter";
import { SEO } from "@/components/composite/seo";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import {
	createUrlArraySignal,
	createUrlSignal,
	createUrlStringSignal,
} from "@/hooks/createUrlSignal";
import { Layout } from "@/layout/Layout";
import {
	PACKAGES_INITIAL_LIMIT,
	PACKAGES_LOAD_MORE_COUNT,
} from "@/lib/constants";
import type { Registry, RegistryFilter } from "@/lib/registries";
import { type Package, ResultsGrid } from "./sections/ResultsGrid";
import { SearchBar } from "./sections/SearchBar";

export const Packages = () => {
	// URL-synced state
	const [searchValue, setSearchValue] = createUrlStringSignal("q");
	const [registryFilter, setRegistryFilter] = createUrlSignal<RegistryFilter>(
		"registry",
		"all",
		{
			parse: (v) => (v as RegistryFilter) || "all",
			serialize: (v) => (v !== "all" ? v : undefined),
		},
	);
	const [selectedTagSlugs, setSelectedTagSlugs] = createUrlArraySignal("tags");

	// Local state for infinite scroll
	const [limit, setLimit] = createSignal(PACKAGES_INITIAL_LIMIT);

	const searchTerm = () => searchValue().trim();
	const hasSearchTerm = () => searchTerm().length > 0;
	const hasActiveFilters = () =>
		hasSearchTerm() ||
		registryFilter() !== "all" ||
		selectedTagSlugs().length > 0;

	const effectiveRegistry = (): Registry | undefined =>
		registryFilter() !== "all" ? (registryFilter() as Registry) : undefined;

	// Tags for filter
	const [tagsWithCounts] = useQuery(queries.tags.listWithCounts);
	const tagOptions = createMemo((): readonly FilterOption[] => {
		const tags = tagsWithCounts();
		if (!tags) return [];
		return tags.map((tag) => ({
			value: tag.slug,
			label: tag.name,
			count: tag.packageTags?.length ?? 0,
		}));
	});

	// Recent packages when no filters
	const [recentPackages, recentResult] = useQuery(() =>
		queries.packages.recent({ limit: limit() }),
	);

	// Query 1: Exact matches (name === searchTerm) - runs in parallel
	const [exactMatchResults, exactMatchResult] = useQuery(() =>
		queries.packages.exactMatches({
			name: searchTerm(),
			registry: effectiveRegistry(),
		}),
	);

	// Query 2: Search results (partial matches) - runs in parallel
	// Over-fetch slightly to have room for: exact match duplicates removal + evening out
	const [searchResults, searchResult] = useQuery(() => {
		const registry = registryFilter();
		return queries.packages.search({
			query: searchTerm() || undefined,
			registry: registry !== "all" ? (registry as Registry) : undefined,
			tagSlugs: selectedTagSlugs().length > 0 ? selectedTagSlugs() : undefined,
			limit: limit() + 8, // Buffer for exact match overlap + even-ing
		});
	});

	// Query completion - both search queries must complete
	const allQueriesComplete = () => {
		if (!hasActiveFilters()) {
			return recentResult().type === "complete";
		}
		return (
			searchResult().type === "complete" &&
			(!hasSearchTerm() || exactMatchResult().type === "complete")
		);
	};

	// Get display packages (search results minus exact matches)
	const getDisplayPackages = (
		results: Package[],
		exactMatches: Package[],
	): Package[] => {
		const exactIds = new Set(exactMatches.map((p) => p.id));
		const others = results.filter((p) => !exactIds.has(p.id));

		// Calculate target count for even total
		const showAdd = hasSearchTerm() && exactMatches.length === 0;
		const specialCount = exactMatches.length + (showAdd ? 1 : 0);
		const targetOthers = Math.max(0, limit() - specialCount);

		const trimmed = others.slice(0, targetOthers);
		const total = specialCount + trimmed.length;

		// Ensure even total
		if (total % 2 === 1 && trimmed.length > 0) {
			return trimmed.slice(0, -1);
		}
		return trimmed;
	};

	// Stable snapshot signals
	const [stablePackages, setStablePackages] = createSignal<Package[]>([]);
	const [stableExactMatches, setStableExactMatches] = createSignal<Package[]>(
		[],
	);
	const [stableShowAddCard, setStableShowAddCard] = createSignal(false);
	const [stableCanLoadMore, setStableCanLoadMore] = createSignal(false);

	// Check if we can load more (search over-fetches by 8, so check against that)
	const canLoadMore = () => {
		if (!hasActiveFilters()) {
			return (recentPackages()?.length ?? 0) >= limit();
		}
		// We over-fetch by 8, so if we got the full buffer, there's likely more
		return (searchResults()?.length ?? 0) >= limit() + 8;
	};

	// Track filter state for stabilization
	const [lastFilterKey, setLastFilterKey] = createSignal("");
	const [lastLimit, setLastLimit] = createSignal(PACKAGES_INITIAL_LIMIT);
	const currentFilterKey = () =>
		`${searchValue()}|${registryFilter()}|${selectedTagSlugs().join(",")}`;

	// Stabilize package order: keep existing order, append new items
	const stabilizePackages = (
		newPkgs: Package[],
		oldPkgs: Package[],
		filtersChanged: boolean,
	): Package[] => {
		if (filtersChanged || oldPkgs.length === 0) {
			return newPkgs;
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

	// Update snapshots when queries complete
	createEffect(() => {
		if (!allQueriesComplete()) return;

		const filterKey = currentFilterKey();
		const oldFilterKey = untrack(() => lastFilterKey());
		const filtersChanged = filterKey !== oldFilterKey;

		// Detect load-more action (limit increased without filter change)
		const currentLimit = limit();
		const prevLimit = untrack(() => lastLimit());
		const isLoadMore = !filtersChanged && currentLimit > prevLimit;

		let packages: Package[];
		let exactMatches: Package[] = [];
		let showAdd = false;

		if (!hasActiveFilters()) {
			packages = (recentPackages() as Package[]) ?? [];
		} else {
			exactMatches = hasSearchTerm()
				? ((exactMatchResults() as Package[]) ?? [])
				: [];
			const results = (searchResults() as Package[]) ?? [];
			packages = getDisplayPackages(results, exactMatches);
			showAdd = hasSearchTerm() && exactMatches.length === 0;
		}

		const loadMore = canLoadMore();
		const oldPackages = untrack(() => stablePackages());

		// Only block shorter results during load-more (prevents flicker)
		// During normal sync, accept deletions
		if (isLoadMore && packages.length < oldPackages.length) {
			return;
		}

		const stabilized = stabilizePackages(packages, oldPackages, filtersChanged);

		batch(() => {
			setStablePackages(stabilized);
			setStableExactMatches(exactMatches);
			setStableShowAddCard(showAdd);
			setStableCanLoadMore(loadMore);
			if (filtersChanged) {
				setLastFilterKey(filterKey);
			}
			setLastLimit(currentLimit);
		});
	});

	// Track initial load
	const [hasEverLoaded, setHasEverLoaded] = createSignal(false);
	const isInitialLoading = () => !hasEverLoaded() && !allQueriesComplete();

	createEffect(() => {
		if (allQueriesComplete() && !hasEverLoaded()) {
			setHasEverLoaded(true);
		}
	});

	// Reset limit on filter change
	createEffect(
		on([searchValue, registryFilter, selectedTagSlugs], () => {
			setLimit(PACKAGES_INITIAL_LIMIT);
		}),
	);

	const handleLoadMore = () => {
		setLimit((prev) => prev + PACKAGES_LOAD_MORE_COUNT);
	};

	return (
		<Layout>
			<SEO
				title="Browse Packages"
				description="Search and discover npm packages. Request packages, view details, and track dependencies."
			/>
			<Container size="md">
				<Stack spacing="xl" class="py-8">
					<Stack spacing="sm" align="center">
						<Heading level="h1" class="text-center">
							Packages
						</Heading>
						<Text color="muted" class="text-center" as="p">
							Search for packages or request new ones
						</Text>
					</Stack>

					<SearchBar
						searchValue={searchValue()}
						registryFilter={registryFilter()}
						selectedTagSlugs={selectedTagSlugs()}
						tagOptions={tagOptions()}
						onSearchChange={setSearchValue}
						onRegistryChange={setRegistryFilter}
						onTagsChange={setSelectedTagSlugs}
					/>

					<ResultsGrid
						packages={stablePackages()}
						isLoading={isInitialLoading()}
						hasActiveFilters={hasActiveFilters()}
						canLoadMore={stableCanLoadMore()}
						onLoadMore={handleLoadMore}
						exactMatches={stableExactMatches()}
						showAddCard={stableShowAddCard()}
						searchTerm={searchTerm()}
						registry={effectiveRegistry()}
					/>
				</Stack>
			</Container>
		</Layout>
	);
};

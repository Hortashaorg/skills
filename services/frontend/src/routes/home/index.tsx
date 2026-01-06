import { queries, useQuery } from "@package/database/client";
import { createEffect, createMemo, createSignal, on } from "solid-js";
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
import type { Registry, RegistryFilter } from "@/lib/registries";
import { ResultsGrid } from "./sections/ResultsGrid";
import { SearchBar } from "./sections/SearchBar";

const PAGE_SIZE = 20;
const SEARCH_PAGE_SIZE = PAGE_SIZE - 1; // Leave room for exact match or add card

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

	// Local state (not URL-synced)
	const [page, setPage] = createSignal(0);
	const [searchLimit, setSearchLimit] = createSignal(100);

	const searchTerm = () => searchValue().trim();
	const hasSearchTerm = () => searchTerm().length > 0;
	const hasActiveFilters = () =>
		hasSearchTerm() || selectedTagSlugs().length > 0;

	// Effective registry for exact match and request
	const effectiveRegistry = (): Registry | undefined =>
		registryFilter() !== "all" ? (registryFilter() as Registry) : undefined;

	// Exact match query - runs when there's a search term
	const [exactMatch, exactMatchResult] = useQuery(() =>
		queries.packages.exactMatch({
			name: searchTerm(),
			registry: effectiveRegistry(),
		}),
	);

	const showAddCard = () =>
		hasSearchTerm() && !exactMatch() && exactMatchResult().type === "complete";

	// Recent packages when no filters
	const [recentPackages, recentResult] = useQuery(() =>
		queries.packages.recent({ limit: PAGE_SIZE }),
	);

	// Search results when filters active
	const [searchResults, searchResult] = useQuery(() => {
		const registry = registryFilter();
		return queries.packages.search({
			query: searchTerm() || undefined,
			registry: registry !== "all" ? (registry as Registry) : undefined,
			tagSlugs: selectedTagSlugs().length > 0 ? selectedTagSlugs() : undefined,
			limit: searchLimit(),
		});
	});

	// Loading state based on which queries are active
	const isLoading = () => {
		if (!hasActiveFilters()) {
			return recentResult().type !== "complete";
		}
		return (
			searchResult().type !== "complete" ||
			(hasSearchTerm() && exactMatchResult().type !== "complete")
		);
	};

	// Reset page and limit when filters change
	createEffect(
		on([searchValue, registryFilter, selectedTagSlugs], () => {
			setPage(0);
			setSearchLimit(100);
		}),
	);

	// Check if we can load more results (current results equal limit)
	const canLoadMore = () =>
		hasActiveFilters() && (searchResults()?.length ?? 0) >= searchLimit();

	const handleLoadMore = () => {
		setSearchLimit((prev) => prev + 100);
	};

	// Display packages - filter out exact match to avoid duplication
	const displayPackages = createMemo(() => {
		if (!hasActiveFilters()) {
			return recentPackages() ?? [];
		}
		const results = searchResults() ?? [];
		const exact = exactMatch();
		if (exact) {
			return results.filter((p) => p.id !== exact.id);
		}
		return results;
	});

	const totalCount = () => displayPackages().length;

	// Paginate results (only when filters are active)
	const paginatedPackages = createMemo(() => {
		if (!hasActiveFilters()) return displayPackages();
		const start = page() * SEARCH_PAGE_SIZE;
		return displayPackages().slice(start, start + SEARCH_PAGE_SIZE);
	});

	return (
		<Layout>
			<Container size="md">
				<Stack spacing="xl" class="py-8">
					{/* Header */}
					<Stack spacing="sm" align="center">
						<Heading level="h1" class="text-center">
							Packages
						</Heading>
						<Text color="muted" class="text-center" as="p">
							Search for packages or request new ones
						</Text>
					</Stack>

					{/* Search with registry and tag filters */}
					<SearchBar
						searchValue={searchValue()}
						registryFilter={registryFilter()}
						selectedTagSlugs={selectedTagSlugs()}
						onSearchChange={setSearchValue}
						onRegistryChange={setRegistryFilter}
						onTagsChange={setSelectedTagSlugs}
					/>

					{/* Results grid with exact match or add card first */}
					<ResultsGrid
						packages={paginatedPackages()}
						totalCount={totalCount()}
						page={page()}
						pageSize={hasActiveFilters() ? SEARCH_PAGE_SIZE : PAGE_SIZE}
						onPageChange={setPage}
						isLoading={isLoading()}
						hasActiveFilters={hasActiveFilters()}
						hasExactTotal={!hasActiveFilters()}
						canLoadMore={canLoadMore()}
						onLoadMore={handleLoadMore}
						exactMatch={exactMatch()}
						showAddCard={showAddCard()}
						searchTerm={searchTerm()}
						registry={effectiveRegistry()}
					/>
				</Stack>
			</Container>
		</Layout>
	);
};

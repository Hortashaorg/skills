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

const INITIAL_LIMIT = 20;
const LOAD_MORE_COUNT = 20;

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
	const [limit, setLimit] = createSignal(INITIAL_LIMIT);

	const searchTerm = () => searchValue().trim();
	const hasSearchTerm = () => searchTerm().length > 0;
	const hasActiveFilters = () =>
		hasSearchTerm() ||
		registryFilter() !== "all" ||
		selectedTagSlugs().length > 0;

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

	// Adjust limit when exact match or add card takes a slot
	const hasFirstCardSlot = () => !!exactMatch() || showAddCard();
	const adjustedLimit = () => (hasFirstCardSlot() ? limit() - 1 : limit());

	// Recent packages when no filters
	const [recentPackages, recentResult] = useQuery(() =>
		queries.packages.recent({ limit: limit() }),
	);

	// Search results when filters active
	const [searchResults, searchResult] = useQuery(() => {
		const registry = registryFilter();
		return queries.packages.search({
			query: searchTerm() || undefined,
			registry: registry !== "all" ? (registry as Registry) : undefined,
			tagSlugs: selectedTagSlugs().length > 0 ? selectedTagSlugs() : undefined,
			limit: adjustedLimit(),
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

	// Reset limit when filters change
	createEffect(
		on([searchValue, registryFilter, selectedTagSlugs], () => {
			setLimit(INITIAL_LIMIT);
		}),
	);

	// Check if we can load more (current results equal limit)
	const canLoadMore = () => {
		if (!hasActiveFilters()) {
			return (recentPackages()?.length ?? 0) >= limit();
		}
		return (searchResults()?.length ?? 0) >= adjustedLimit();
	};

	const handleLoadMore = () => {
		setLimit((prev) => prev + LOAD_MORE_COUNT);
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

					{/* Results grid with infinite scroll */}
					<ResultsGrid
						packages={displayPackages()}
						isLoading={isLoading()}
						hasActiveFilters={hasActiveFilters()}
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

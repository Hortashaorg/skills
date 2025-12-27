import {
	queries,
	useConnectionState,
	useQuery,
} from "@package/database/client";
import { useSearchParams } from "@solidjs/router";
import { createEffect, createMemo, createSignal, on, Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { EmptyState } from "@/components/ui/empty-state";
import { Layout } from "@/layout/Layout";
import type { Registry, RegistryFilter } from "@/lib/registries";
import { RecentPackages } from "./sections/RecentPackages";
import { RequestForm } from "./sections/RequestForm";
import { ResultsGrid } from "./sections/ResultsGrid";
import { SearchBar } from "./sections/SearchBar";

const PAGE_SIZE = 20;

export const Home = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	const [searchValue, setSearchValue] = createSignal("");
	const [registryFilter, setRegistryFilter] =
		createSignal<RegistryFilter>("all");
	const [requestRegistry, setRequestRegistry] = createSignal<Registry>("npm");
	const [requestedPackages, setRequestedPackages] = createSignal<
		Map<string, string>
	>(new Map());
	const [page, setPage] = createSignal(0);

	// Parse initial values from URL
	const initialSearch = () => (searchParams.q as string) ?? "";
	const initialTags = () => {
		const tagsParam = searchParams.tags as string | undefined;
		return tagsParam ? tagsParam.split(",").filter(Boolean) : [];
	};

	// Initialize signals from URL
	const [selectedTagSlugs, setSelectedTagSlugs] = createSignal<string[]>(
		initialTags(),
	);

	// Set initial search value from URL (only on mount)
	if (initialSearch()) {
		setSearchValue(initialSearch());
	}

	// Sync search and tags to URL
	createEffect(
		on([searchValue, selectedTagSlugs], ([query, slugs]) => {
			setSearchParams(
				{
					q: query.trim() || undefined,
					tags: slugs.length > 0 ? slugs.join(",") : undefined,
				},
				{ replace: true },
			);
		}),
	);

	// Query all packages and filter client-side
	const [packages] = useQuery(queries.packages.list);
	const connectionState = useConnectionState();

	// Loading state - true when packages haven't loaded yet or Zero is connecting
	const isLoading = () =>
		packages() === undefined || connectionState().name === "connecting";

	// Reset page when search, registry, or tags change
	createEffect(
		on([searchValue, registryFilter, selectedTagSlugs], () => {
			setPage(0);
		}),
	);

	// Check if any filters are active
	const hasActiveFilters = () =>
		searchValue().trim().length > 0 || selectedTagSlugs().length > 0;

	// Filter packages based on search input, registry, and tags, sorted by upvotes
	const filteredPackages = createMemo(() => {
		const query = searchValue().toLowerCase().trim();
		const tagSlugs = selectedTagSlugs();

		// Return empty if no search query AND no tags selected
		if (!query && tagSlugs.length === 0) return [];

		const allPackages = packages() || [];
		const registry = registryFilter();

		return allPackages
			.filter((pkg) => {
				// Search matches if no query or name includes query
				const matchesSearch = !query || pkg.name.toLowerCase().includes(query);
				const matchesRegistry = registry === "all" || pkg.registry === registry;
				const matchesTags =
					tagSlugs.length === 0 ||
					pkg.packageTags?.some((pt) => tagSlugs.includes(pt.tag?.slug ?? ""));
				return matchesSearch && matchesRegistry && matchesTags;
			})
			.sort((a, b) => (b.upvotes?.length ?? 0) - (a.upvotes?.length ?? 0));
	});

	// Paginate filtered results
	const paginatedPackages = createMemo(() => {
		const start = page() * PAGE_SIZE;
		return filteredPackages().slice(start, start + PAGE_SIZE);
	});

	// Recently updated packages for empty state
	const recentPackages = createMemo(() => {
		const allPackages = packages() || [];
		return [...allPackages]
			.sort((a, b) => b.updatedAt - a.updatedAt)
			.slice(0, 8);
	});

	// Check if the exact search term exists in packages (respecting registry filter)
	const exactMatchExists = createMemo(() => {
		const query = searchValue().toLowerCase().trim();
		if (!query) return false;

		const allPackages = packages() || [];
		const registry = registryFilter();

		return allPackages.some((pkg) => {
			const nameMatches = pkg.name.toLowerCase() === query;
			const registryMatches = registry === "all" || pkg.registry === registry;
			return nameMatches && registryMatches;
		});
	});

	// Show "not found" state when filters are active but no results
	const showNotFound = createMemo(() => {
		return hasActiveFilters() && filteredPackages().length === 0;
	});

	// Determine which registry to use for the request
	const effectiveRequestRegistry = createMemo((): Registry => {
		const filter = registryFilter();
		if (filter !== "all") return filter;
		return requestRegistry();
	});

	const handleRequestSubmitted = () => {
		const packageName = searchValue().trim();
		const registry = effectiveRequestRegistry();
		const key = `${packageName.toLowerCase()}:${registry}`;
		setRequestedPackages((prev) => {
			const newMap = new Map(prev);
			newMap.set(key, "pending");
			return newMap;
		});
	};

	const isRequested = createMemo(() => {
		const packageName = searchValue().trim();
		const registry = effectiveRequestRegistry();
		const key = `${packageName.toLowerCase()}:${registry}`;
		return requestedPackages().has(key);
	});

	return (
		<Layout>
			<Container size="md">
				<Stack spacing="xl" class="py-8">
					{/* Header */}
					<Stack spacing="sm" align="center">
						<Heading level="h1" class="text-center">
							TechGarden
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

					{/* Search results as card grid */}
					<ResultsGrid
						packages={paginatedPackages()}
						totalCount={filteredPackages().length}
						page={page()}
						pageSize={PAGE_SIZE}
						onPageChange={setPage}
					/>

					{/* Not found state - show empty state and request option (only after loading) */}
					<Show when={showNotFound() && !isLoading()}>
						<EmptyState
							icon={
								<svg
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									class="w-full h-full"
									aria-hidden="true"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="1.5"
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
							}
							title="No packages found"
							description={
								selectedTagSlugs().length > 0 && !searchValue().trim()
									? "No packages match the selected tags."
									: "Try a different search term or adjust your filters."
							}
						/>
					</Show>

					{/* Request form when package doesn't exist */}
					<Show
						when={showNotFound() && !exactMatchExists() && searchValue().trim()}
					>
						<RequestForm
							searchValue={searchValue()}
							effectiveRegistry={effectiveRequestRegistry()}
							requestRegistry={requestRegistry()}
							showRegistryPicker={registryFilter() === "all"}
							isRequested={isRequested()}
							onRegistryChange={setRequestRegistry}
							onRequestSubmitted={handleRequestSubmitted}
						/>
					</Show>

					{/* Loading state */}
					<Show when={isLoading() && !hasActiveFilters()}>
						<div class="flex justify-center py-12">
							<div class="flex items-center gap-2 text-on-surface-muted dark:text-on-surface-dark-muted">
								<svg
									class="animate-spin h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									/>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								<span class="text-sm">Loading packages...</span>
							</div>
						</div>
					</Show>

					{/* Empty state when no filters - show recent packages */}
					<Show
						when={
							!isLoading() && !hasActiveFilters() && recentPackages().length > 0
						}
					>
						<RecentPackages packages={recentPackages()} />
					</Show>
				</Stack>
			</Container>
		</Layout>
	);
};

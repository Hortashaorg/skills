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
import { Layout } from "@/layout/Layout";
import type { Registry, RegistryFilter } from "@/lib/registries";
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

	// Unified package list - either filtered results or recent packages
	const displayPackages = createMemo(() => {
		const allPackages = packages() || [];
		const query = searchValue().toLowerCase().trim();
		const tagSlugs = selectedTagSlugs();
		const registry = registryFilter();

		// If no filters, show recent packages sorted by updatedAt
		if (!query && tagSlugs.length === 0) {
			return [...allPackages]
				.sort((a, b) => b.updatedAt - a.updatedAt)
				.slice(0, PAGE_SIZE);
		}

		// With filters, filter and sort by upvotes
		return allPackages
			.filter((pkg) => {
				const matchesSearch = !query || pkg.name.toLowerCase().includes(query);
				const matchesRegistry = registry === "all" || pkg.registry === registry;
				const matchesTags =
					tagSlugs.length === 0 ||
					pkg.packageTags?.some((pt) => tagSlugs.includes(pt.tag?.slug ?? ""));
				return matchesSearch && matchesRegistry && matchesTags;
			})
			.sort((a, b) => (b.upvotes?.length ?? 0) - (a.upvotes?.length ?? 0));
	});

	// Total count for pagination (only applies when filters are active)
	const totalCount = () => displayPackages().length;

	// Paginate results (only when filters are active)
	const paginatedPackages = createMemo(() => {
		if (!hasActiveFilters()) {
			return displayPackages();
		}
		const start = page() * PAGE_SIZE;
		return displayPackages().slice(start, start + PAGE_SIZE);
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

	// Show request form when searching for something that doesn't exist
	const showRequestForm = () =>
		hasActiveFilters() &&
		!isLoading() &&
		totalCount() === 0 &&
		!exactMatchExists() &&
		searchValue().trim().length > 0;

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

	// Empty state message based on filter type
	const emptyMessage = () => {
		if (selectedTagSlugs().length > 0 && !searchValue().trim()) {
			return "No packages match the selected tags.";
		}
		return "No packages found";
	};

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

					{/* Unified package grid - handles loading, empty, and results */}
					<ResultsGrid
						packages={paginatedPackages()}
						totalCount={totalCount()}
						page={page()}
						pageSize={PAGE_SIZE}
						onPageChange={setPage}
						isLoading={isLoading()}
						hasActiveFilters={hasActiveFilters()}
						emptyMessage={emptyMessage()}
					/>

					{/* Request form when package doesn't exist */}
					<Show when={showRequestForm()}>
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
				</Stack>
			</Container>
		</Layout>
	);
};

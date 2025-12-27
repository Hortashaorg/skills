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
import { usePackageRequest } from "@/hooks/usePackageRequest";
import { Layout } from "@/layout/Layout";
import type { RegistryFilter } from "@/lib/registries";
import { RequestForm } from "./sections/RequestForm";
import { ResultsGrid } from "./sections/ResultsGrid";
import { SearchBar } from "./sections/SearchBar";

const PAGE_SIZE = 20;

export const Home = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	// Initialize state from URL params
	const [searchValue, setSearchValue] = createSignal(
		(searchParams.q as string) ?? "",
	);
	const [registryFilter, setRegistryFilter] = createSignal<RegistryFilter>(
		(searchParams.registry as RegistryFilter) ?? "all",
	);
	const [selectedTagSlugs, setSelectedTagSlugs] = createSignal<string[]>(
		searchParams.tags
			? String(searchParams.tags).split(",").filter(Boolean)
			: [],
	);
	const [page, setPage] = createSignal(0);

	// Sync filters to URL
	createEffect(
		on(
			[searchValue, registryFilter, selectedTagSlugs],
			([query, registry, slugs]) => {
				setSearchParams(
					{
						q: query.trim() || undefined,
						registry: registry !== "all" ? registry : undefined,
						tags: slugs.length > 0 ? slugs.join(",") : undefined,
					},
					{ replace: true },
				);
			},
		),
	);

	// Query all packages and filter client-side
	const [packages] = useQuery(queries.packages.list);
	const connectionState = useConnectionState();

	// Loading state
	const isLoading = () =>
		packages() === undefined || connectionState().name === "connecting";

	// Reset page when filters change
	createEffect(
		on([searchValue, registryFilter, selectedTagSlugs], () => setPage(0)),
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

	const totalCount = () => displayPackages().length;

	// Paginate results (only when filters are active)
	const paginatedPackages = createMemo(() => {
		if (!hasActiveFilters()) return displayPackages();
		const start = page() * PAGE_SIZE;
		return displayPackages().slice(start, start + PAGE_SIZE);
	});

	// Package request logic
	const request = usePackageRequest({
		searchValue,
		registryFilter,
		packages,
	});

	// Show request form when searching for something that doesn't exist
	const showRequestForm = () =>
		hasActiveFilters() &&
		!isLoading() &&
		totalCount() === 0 &&
		!request.exactMatchExists() &&
		searchValue().trim().length > 0;

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
							effectiveRegistry={request.effectiveRegistry()}
							requestRegistry={request.requestRegistry()}
							showRegistryPicker={registryFilter() === "all"}
							isRequested={request.isRequested()}
							onRegistryChange={request.setRequestRegistry}
							onRequestSubmitted={request.markRequested}
						/>
					</Show>
				</Stack>
			</Container>
		</Layout>
	);
};

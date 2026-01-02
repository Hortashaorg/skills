import { queries, useQuery, useZero } from "@package/database/client";
import {
	createEffect,
	createMemo,
	createSignal,
	For,
	on,
	Show,
} from "solid-js";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { createPackageRequest } from "@/hooks/createPackageRequest";
import {
	createUrlArraySignal,
	createUrlSignal,
	createUrlStringSignal,
} from "@/hooks/createUrlSignal";
import { Layout } from "@/layout/Layout";
import { getAuthorizationUrl, saveReturnUrl } from "@/lib/auth-url";
import {
	REGISTRY_OPTIONS,
	type Registry,
	type RegistryFilter,
} from "@/lib/registries";
import { ResultsGrid } from "./sections/ResultsGrid";
import { SearchBar } from "./sections/SearchBar";

const PAGE_SIZE = 20;

export const Packages = () => {
	const zero = useZero();

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
	const [requestRegistry, setRequestRegistry] = createSignal<Registry>("npm");

	// Check if any filters are active
	const hasActiveFilters = () =>
		searchValue().trim().length > 0 || selectedTagSlugs().length > 0;

	// Use different queries based on whether filters are active
	// Recent packages when no filters, search results when filters active
	const [recentPackages, recentResult] = useQuery(() =>
		queries.packages.recent({ limit: PAGE_SIZE }),
	);

	const [searchResults, searchResult] = useQuery(() => {
		const registry = registryFilter();
		return queries.packages.search({
			query: searchValue().trim() || undefined,
			registry: registry !== "all" ? (registry as Registry) : undefined,
			tagSlugs: selectedTagSlugs().length > 0 ? selectedTagSlugs() : undefined,
			limit: searchLimit(),
		});
	});

	// Loading state based on which query is active
	const isLoading = () =>
		hasActiveFilters()
			? searchResult().type !== "complete"
			: recentResult().type !== "complete";

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

	// Display packages - use appropriate query result
	// Search results are sorted alphabetically by name (server-side)
	// Recently updated are sorted by updatedAt (server-side)
	const displayPackages = createMemo(() => {
		if (!hasActiveFilters()) {
			return recentPackages() ?? [];
		}
		return searchResults() ?? [];
	});

	const totalCount = () => displayPackages().length;

	// Paginate results (only when filters are active)
	const paginatedPackages = createMemo(() => {
		if (!hasActiveFilters()) return displayPackages();
		const start = page() * PAGE_SIZE;
		return displayPackages().slice(start, start + PAGE_SIZE);
	});

	// Effective registry for request (use filter if specific, otherwise requestRegistry)
	const effectiveRegistry = (): Registry =>
		registryFilter() !== "all"
			? (registryFilter() as Registry)
			: requestRegistry();

	// Package request hook
	const packageRequest = createPackageRequest(() => ({
		name: searchValue().trim(),
		registry: effectiveRegistry(),
	}));

	// Can show request option when searching for something not in DB
	const canRequest = () =>
		hasActiveFilters() &&
		!isLoading() &&
		totalCount() === 0 &&
		searchValue().trim().length > 0;

	// Empty state message based on filter type
	const emptyMessage = () => {
		if (selectedTagSlugs().length > 0 && !searchValue().trim()) {
			return "No packages match the selected tags.";
		}
		if (canRequest()) {
			return `"${searchValue()}" not found`;
		}
		return "No packages found";
	};

	const emptyDescription = () => {
		if (canRequest()) {
			return "This package isn't in our database yet. Request it to add it.";
		}
		return "Try a different search term or adjust your filters.";
	};

	// Handle registry change for request
	const handleRegistryChange = (
		e: Event & { currentTarget: HTMLSelectElement },
	) => {
		setRequestRegistry(e.currentTarget.value as Registry);
	};

	// Build the empty state action (request button)
	const emptyAction = () => {
		if (!canRequest()) return undefined;

		const isLoggedIn = zero().userID !== "anon";

		if (!isLoggedIn) {
			return (
				<Button
					variant="primary"
					onClick={() => {
						saveReturnUrl();
						window.location.href = getAuthorizationUrl();
					}}
				>
					Sign in to request
				</Button>
			);
		}

		if (packageRequest.isRequested()) {
			return <Badge variant="success">Request submitted</Badge>;
		}

		return (
			<Flex gap="sm" align="center">
				<Show when={registryFilter() === "all"}>
					<select
						value={requestRegistry()}
						onChange={handleRegistryChange}
						aria-label="Select registry for package request"
						disabled={packageRequest.isSubmitting()}
						class="h-10 rounded-md border border-outline dark:border-outline-dark bg-surface dark:bg-surface-dark px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<For each={REGISTRY_OPTIONS}>
							{(option) => <option value={option.value}>{option.label}</option>}
						</For>
					</select>
				</Show>
				<Button
					variant="primary"
					onClick={() => packageRequest.submit()}
					disabled={packageRequest.isSubmitting()}
				>
					<Show
						when={packageRequest.isSubmitting()}
						fallback={`Request from ${effectiveRegistry()}`}
					>
						<Spinner size="sm" srText="Requesting package" />
						<span class="ml-2">Requesting...</span>
					</Show>
				</Button>
			</Flex>
		);
	};

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

					{/* Unified package grid - handles loading, empty, and results */}
					<ResultsGrid
						packages={paginatedPackages()}
						totalCount={totalCount()}
						page={page()}
						pageSize={PAGE_SIZE}
						onPageChange={setPage}
						isLoading={isLoading()}
						hasActiveFilters={hasActiveFilters()}
						hasExactTotal={!hasActiveFilters()}
						canLoadMore={canLoadMore()}
						onLoadMore={handleLoadMore}
						emptyMessage={emptyMessage()}
						emptyDescription={emptyDescription()}
						emptyAction={emptyAction()}
					/>
				</Stack>
			</Container>
		</Layout>
	);
};

import {
	queries,
	useConnectionState,
	useQuery,
	useZero,
} from "@package/database/client";
import { useSearchParams } from "@solidjs/router";
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

export const Home = () => {
	const zero = useZero();
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
	const [requestRegistry, setRequestRegistry] = createSignal<Registry>("npm");

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

	// Effective registry for request (use filter if specific, otherwise requestRegistry)
	const effectiveRegistry = (): Registry =>
		registryFilter() !== "all"
			? (registryFilter() as Registry)
			: requestRegistry();

	// Package request hook
	const packageRequest = createPackageRequest(() => ({
		packageName: searchValue().trim(),
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
						emptyDescription={emptyDescription()}
						emptyAction={emptyAction()}
					/>
				</Stack>
			</Container>
		</Layout>
	);
};

import { mutators, queries, useQuery, useZero } from "@package/database/client";
import { createMemo, createSignal, For, Show } from "solid-js";
import {
	SearchInput,
	type SearchResultItem,
} from "@/components/composite/search-input";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { Layout } from "@/layout/Layout";
import { getAuthorizationUrl } from "@/lib/auth-url";
import {
	getRegistryLabel,
	REGISTRY_FILTER_OPTIONS,
	REGISTRY_OPTIONS,
	type Registry,
	type RegistryFilter,
} from "@/lib/registries";

export const Home = () => {
	const zero = useZero();
	const [searchValue, setSearchValue] = createSignal("");
	const [registryFilter, setRegistryFilter] =
		createSignal<RegistryFilter>("all");
	const [requestRegistry, setRequestRegistry] = createSignal<Registry>("npm");
	const [requestedPackages, setRequestedPackages] = createSignal<
		Map<string, string>
	>(new Map());

	// Query all packages and filter client-side
	const [packages] = useQuery(queries.packages.list);

	// Filter packages based on search input and registry
	const filteredPackages = createMemo(() => {
		const query = searchValue().toLowerCase().trim();
		if (!query) return [];

		const allPackages = packages() || [];
		const registry = registryFilter();

		return allPackages.filter((pkg) => {
			const matchesSearch =
				pkg.name.toLowerCase().includes(query) ||
				pkg.description?.toLowerCase().includes(query);
			const matchesRegistry = registry === "all" || pkg.registry === registry;
			return matchesSearch && matchesRegistry;
		});
	});

	// Convert packages to SearchResultItem format
	const searchResults = createMemo((): SearchResultItem[] => {
		return filteredPackages().map((pkg) => ({
			id: pkg.id,
			primary: pkg.name,
			secondary: pkg.description || undefined,
			label: pkg.registry,
		}));
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

	// Show "not found" state when user has typed but no results
	const showNotFound = createMemo(() => {
		const query = searchValue().trim();
		return query.length > 0 && searchResults().length === 0;
	});

	// Determine which registry to use for the request
	const effectiveRequestRegistry = createMemo((): Registry => {
		const filter = registryFilter();
		if (filter !== "all") return filter;
		return requestRegistry();
	});

	const handleSelect = (item: SearchResultItem) => {
		// TODO: Navigate to package detail page
		console.log("Selected package:", item);
	};

	const handleRequestPackage = async () => {
		const packageName = searchValue().trim();
		if (!packageName) return;

		const registry = effectiveRequestRegistry();

		const write = zero().mutate(
			mutators.packageRequests.create({
				packageName,
				registry,
			}),
		);

		const res = await write.client;

		if (res.type === "error") {
			console.error("Failed to request package:", res.error);
			toast.error("Failed to submit request. Please try again.");
			return;
		}

		// Track that we requested this package
		const key = `${packageName.toLowerCase()}:${registry}`;
		setRequestedPackages((prev) => {
			const newMap = new Map(prev);
			newMap.set(key, "pending");
			return newMap;
		});

		toast.success(`Request submitted for "${packageName}" on ${registry}`);
	};

	const getRequestStatus = (packageName: string, registry: Registry) => {
		const key = `${packageName.toLowerCase()}:${registry}`;
		return requestedPackages().get(key);
	};

	const handleRegistryFilterChange = (e: Event) => {
		const target = e.target as HTMLSelectElement;
		setRegistryFilter(target.value as RegistryFilter);
	};

	const handleRequestRegistryChange = (e: Event) => {
		const target = e.target as HTMLSelectElement;
		setRequestRegistry(target.value as Registry);
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

					{/* Search with registry filter */}
					<Flex gap="sm" align="stretch">
						<select
							value={registryFilter()}
							onChange={handleRegistryFilterChange}
							class="h-10 rounded-md border border-outline dark:border-outline-dark bg-surface dark:bg-surface-dark px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2 cursor-pointer"
						>
							<For each={REGISTRY_FILTER_OPTIONS}>
								{(option) => (
									<option value={option.value}>{option.label}</option>
								)}
							</For>
						</select>
						<div class="flex-1">
							<SearchInput
								value={searchValue()}
								onValueChange={setSearchValue}
								results={searchResults()}
								onSelect={handleSelect}
								placeholder="Search packages..."
								noResultsMessage={`No packages found for "${searchValue()}"`}
							/>
						</div>
					</Flex>

					{/* Not found state - show request option */}
					<Show when={showNotFound() && !exactMatchExists()}>
						<Card padding="lg">
							<Stack spacing="md" align="center">
								<Stack spacing="xs" align="center">
									<Text weight="semibold">"{searchValue()}" not found</Text>
									<Text color="muted" size="sm" class="text-center">
										This package isn't in our database yet.
										<Show when={zero().userID === "anon"}>
											{" "}
											Sign in to request it.
										</Show>
									</Text>
								</Stack>

								<Show
									when={zero().userID !== "anon"}
									fallback={
										<a
											href={getAuthorizationUrl()}
											class="inline-flex items-center justify-center whitespace-nowrap rounded-radius border font-medium tracking-wide transition hover:opacity-75 cursor-pointer bg-primary border-primary text-on-primary dark:bg-primary-dark dark:border-primary-dark dark:text-on-primary-dark text-sm px-4 py-2"
										>
											Sign in to request
										</a>
									}
								>
									<Show
										when={
											!getRequestStatus(
												searchValue(),
												effectiveRequestRegistry(),
											)
										}
										fallback={
											<Badge variant="info" size="md">
												Request submitted
											</Badge>
										}
									>
										<Flex gap="sm" align="center">
											{/* Show registry picker when "all" is selected */}
											<Show when={registryFilter() === "all"}>
												<select
													value={requestRegistry()}
													onChange={handleRequestRegistryChange}
													class="h-10 rounded-md border border-outline dark:border-outline-dark bg-surface dark:bg-surface-dark px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2 cursor-pointer"
												>
													<For each={REGISTRY_OPTIONS}>
														{(option) => (
															<option value={option.value}>
																{option.label}
															</option>
														)}
													</For>
												</select>
											</Show>
											<Button onClick={handleRequestPackage}>
												Request from{" "}
												{getRegistryLabel(effectiveRequestRegistry())}
											</Button>
										</Flex>
									</Show>
								</Show>
							</Stack>
						</Card>
					</Show>
				</Stack>
			</Container>
		</Layout>
	);
};

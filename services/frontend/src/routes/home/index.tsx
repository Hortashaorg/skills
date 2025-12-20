import { queries, useQuery } from "@package/database/client";
import { createMemo, createSignal, Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
import { Layout } from "@/layout/Layout";
import type { Registry, RegistryFilter } from "@/lib/registries";
import { RequestForm } from "./sections/RequestForm";
import { ResultsGrid } from "./sections/ResultsGrid";
import { SearchBar } from "./sections/SearchBar";

const MAX_RESULTS = 20;

export const Home = () => {
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

		return allPackages
			.filter((pkg) => {
				const matchesSearch =
					pkg.name.toLowerCase().includes(query) ||
					pkg.description?.toLowerCase().includes(query);
				const matchesRegistry = registry === "all" || pkg.registry === registry;
				return matchesSearch && matchesRegistry;
			})
			.slice(0, MAX_RESULTS);
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
		return query.length > 0 && filteredPackages().length === 0;
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

					{/* Search with registry filter */}
					<SearchBar
						searchValue={searchValue()}
						registryFilter={registryFilter()}
						onSearchChange={setSearchValue}
						onRegistryChange={setRegistryFilter}
					/>

					{/* Search results as card grid */}
					<ResultsGrid packages={filteredPackages()} maxResults={MAX_RESULTS} />

					{/* Not found state - show request option */}
					<Show when={showNotFound() && !exactMatchExists()}>
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

					{/* Empty state when no search */}
					<Show when={searchValue().trim().length === 0}>
						<Card padding="lg">
							<Stack spacing="sm" align="center">
								<Text color="muted" size="sm" class="text-center">
									Start typing to search for packages
								</Text>
							</Stack>
						</Card>
					</Show>
				</Stack>
			</Container>
		</Layout>
	);
};

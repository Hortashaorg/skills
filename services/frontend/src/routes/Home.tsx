import { mutators, queries, useQuery, useZero } from "@package/database/client";
import { createMemo, createSignal, Show } from "solid-js";
import {
	SearchInput,
	type SearchResultItem,
} from "@/components/composite/search-input";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { Layout } from "@/layout/Layout";
import { getAuthorizationUrl } from "@/lib/auth-url";

export const Home = () => {
	const zero = useZero();
	const [searchValue, setSearchValue] = createSignal("");
	const [requestedPackages, setRequestedPackages] = createSignal<
		Map<string, string>
	>(new Map());

	// Query all packages and filter client-side
	const [packages] = useQuery(queries.packages.list);

	// Filter packages based on search input
	const filteredPackages = createMemo(() => {
		const query = searchValue().toLowerCase().trim();
		if (!query) return [];

		const allPackages = packages() || [];
		return allPackages.filter(
			(pkg) =>
				pkg.name.toLowerCase().includes(query) ||
				pkg.description?.toLowerCase().includes(query),
		);
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

	// Check if the exact search term exists in packages
	const exactMatchExists = createMemo(() => {
		const query = searchValue().toLowerCase().trim();
		if (!query) return false;

		const allPackages = packages() || [];
		return allPackages.some(
			(pkg) => pkg.name.toLowerCase() === query && pkg.registry === "npm",
		);
	});

	// Show "not found" state when user has typed but no results
	const showNotFound = createMemo(() => {
		const query = searchValue().trim();
		return query.length > 0 && searchResults().length === 0;
	});

	const handleSelect = (item: SearchResultItem) => {
		// TODO: Navigate to package detail page
		console.log("Selected package:", item);
	};

	const handleRequestPackage = async () => {
		const packageName = searchValue().trim();
		if (!packageName) return;

		const write = zero().mutate(
			mutators.packageRequests.create({
				packageName,
				registry: "npm",
			}),
		);

		const res = await write.client;

		if (res.type === "error") {
			console.error("Failed to request package:", res.error);
			toast.error("Failed to submit request. Please try again.");
			return;
		}

		// Track that we requested this package
		setRequestedPackages((prev) => {
			const newMap = new Map(prev);
			newMap.set(packageName.toLowerCase(), "pending");
			return newMap;
		});

		toast.success(`Request submitted for "${packageName}"`);
	};

	const getRequestStatus = (packageName: string) => {
		return requestedPackages().get(packageName.toLowerCase());
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
							Search for npm packages or request new ones
						</Text>
					</Stack>

					{/* Search */}
					<SearchInput
						value={searchValue()}
						onValueChange={setSearchValue}
						results={searchResults()}
						onSelect={handleSelect}
						placeholder="Search packages..."
						noResultsMessage={`No packages found for "${searchValue()}"`}
					/>

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
										when={!getRequestStatus(searchValue())}
										fallback={
											<Badge variant="info" size="md">
												Request submitted
											</Badge>
										}
									>
										<Button onClick={handleRequestPackage}>
											Request this package
										</Button>
									</Show>
								</Show>
							</Stack>
						</Card>
					</Show>

					{/* Show some info for authenticated users */}
					<Show when={zero().userID !== "anon"}>
						<Card>
							<Stack spacing="sm">
								<Text size="sm" color="muted">
									Signed in as user {zero().userID.slice(0, 8)}...
								</Text>
							</Stack>
						</Card>
					</Show>
				</Stack>
			</Container>
		</Layout>
	);
};

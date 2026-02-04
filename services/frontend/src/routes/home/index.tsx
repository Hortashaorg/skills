import { queries, useQuery } from "@package/database/client";
import { createEffect, createMemo } from "solid-js";
import type { FilterOption } from "@/components/composite/entity-filter";
import { SEO } from "@/components/composite/seo";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import {
	createUrlArraySignal,
	createUrlSignal,
	createUrlStringSignal,
} from "@/hooks/createUrlSignal";
import { usePackageSearch } from "@/hooks/packages";
import { Layout } from "@/layout/Layout";
import type { RegistryFilter } from "@/lib/registries";
import { ResultsGrid } from "./sections/ResultsGrid";
import { SearchBar } from "./sections/SearchBar";

export const Packages = () => {
	// URL-synced state (page's concern)
	const [urlQuery, setUrlQuery] = createUrlStringSignal("q");
	const [urlRegistry, setUrlRegistry] = createUrlSignal<RegistryFilter>(
		"registry",
		"all",
		{
			parse: (v) => (v as RegistryFilter) || "all",
			serialize: (v) => (v !== "all" ? v : undefined),
		},
	);
	const [urlTags, setUrlTags] = createUrlArraySignal("tags");

	// Package search hook
	const search = usePackageSearch({ showRecentWhenEmpty: true });

	// Sync URL → hook state on mount
	createEffect(() => {
		const q = urlQuery();
		if (q !== search.query()) search.setQuery(q);
	});
	createEffect(() => {
		const r = urlRegistry();
		if (r !== search.registry()) search.setRegistry(r);
	});
	createEffect(() => {
		const t = urlTags();
		if (JSON.stringify(t) !== JSON.stringify(search.tags())) search.setTags(t);
	});

	// Sync hook state → URL when user interacts
	const handleSearchChange = (value: string) => {
		search.setQuery(value);
		setUrlQuery(value);
	};
	const handleRegistryChange = (value: RegistryFilter) => {
		search.setRegistry(value);
		setUrlRegistry(value);
	};
	const handleTagsChange = (slugs: string[]) => {
		search.setTags(slugs);
		setUrlTags(slugs);
	};

	// Tags for filter UI (separate query)
	const [tagsWithCounts] = useQuery(queries.tags.listWithCounts);
	const tagOptions = createMemo((): readonly FilterOption[] => {
		const tags = tagsWithCounts();
		if (!tags) return [];
		return tags.map((tag) => ({
			value: tag.slug,
			label: tag.name,
			count: tag.packageTags?.length ?? 0,
		}));
	});

	// Derived state for UI
	const hasActiveFilters = () =>
		search.query().trim().length > 0 ||
		search.registry() !== "all" ||
		search.tags().length > 0;

	const showAddCard = () =>
		search.query().trim().length > 0 && search.exactMatches().length === 0;

	const effectiveRegistry = () => {
		const reg = search.registry();
		return reg !== "all" ? (reg as Exclude<typeof reg, "all">) : undefined;
	};

	return (
		<Layout>
			<SEO
				title="Browse Packages"
				description="Search and discover npm packages. Request packages, view details, and track dependencies."
			/>
			<Container size="lg">
				<Stack spacing="xl" class="py-8">
					<Stack spacing="sm" align="center">
						<Heading level="h1" class="text-center">
							Packages
						</Heading>
						<Text color="muted" class="text-center" as="p">
							Search for packages or request new ones
						</Text>
					</Stack>

					<SearchBar
						searchValue={search.query()}
						registryFilter={search.registry()}
						selectedTagSlugs={search.tags()}
						tagOptions={tagOptions()}
						onSearchChange={handleSearchChange}
						onRegistryChange={handleRegistryChange}
						onTagsChange={handleTagsChange}
					/>

					<ResultsGrid
						packages={[...search.results()]}
						isLoading={search.isLoading()}
						hasActiveFilters={hasActiveFilters()}
						canLoadMore={search.canLoadMore()}
						onLoadMore={search.loadMore}
						exactMatches={[...search.exactMatches()]}
						showAddCard={showAddCard()}
						searchTerm={search.query().trim()}
						registry={effectiveRegistry()}
					/>
				</Stack>
			</Container>
		</Layout>
	);
};

export default Packages;

import type { Row } from "@package/database/client";
import { For, Match, Show, Switch } from "solid-js";
import { PackageCard } from "@/components/feature/package-card";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createPackageUpvote } from "@/hooks/createPackageUpvote";
import { buildPackageUrl } from "@/lib/url";

type PackageTag = Row["packageTags"] & {
	tag?: Row["tags"];
};

type Package = Row["packages"] & {
	upvotes?: readonly Row["packageUpvotes"][];
	packageTags?: readonly PackageTag[];
};

export interface ResultsGridProps {
	packages: readonly Package[];
	totalCount: number;
	page: number;
	pageSize: number;
	onPageChange: (page: number) => void;
	isLoading?: boolean;
	hasActiveFilters?: boolean;
	emptyMessage?: string;
	emptyDescription?: string;
}

const LoadingSpinner = () => (
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
);

const SearchIcon = () => (
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
);

export const ResultsGrid = (props: ResultsGridProps) => {
	const totalPages = () => Math.ceil(props.totalCount / props.pageSize);
	const startIndex = () => props.page * props.pageSize + 1;
	const endIndex = () =>
		Math.min((props.page + 1) * props.pageSize, props.totalCount);

	const headerText = () => {
		if (props.hasActiveFilters) {
			return `Showing ${startIndex()}-${endIndex()} of ${props.totalCount} result${props.totalCount !== 1 ? "s" : ""}`;
		}
		return "Recently updated";
	};

	return (
		<Switch>
			{/* Loading state */}
			<Match when={props.isLoading}>
				<LoadingSpinner />
			</Match>

			{/* Empty state */}
			<Match when={props.totalCount === 0}>
				<EmptyState
					icon={<SearchIcon />}
					title={props.emptyMessage ?? "No packages found"}
					description={
						props.emptyDescription ??
						"Try a different search term or adjust your filters."
					}
				/>
			</Match>

			{/* Results */}
			<Match when={props.totalCount > 0}>
				<Stack spacing="sm">
					<Text size="sm" color="muted">
						{headerText()}
					</Text>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<For each={props.packages}>
							{(pkg) => {
								const upvote = createPackageUpvote(() => pkg);
								const tags = () =>
									pkg.packageTags
										?.filter(
											(
												pt,
											): pt is typeof pt & {
												tag: NonNullable<typeof pt.tag>;
											} => !!pt.tag,
										)
										.map((pt) => ({
											name: pt.tag.name,
											slug: pt.tag.slug,
										})) ?? [];

								return (
									<PackageCard
										name={pkg.name}
										registry={pkg.registry}
										description={pkg.description}
										href={buildPackageUrl(pkg.registry, pkg.name)}
										upvoteCount={upvote.upvoteCount()}
										isUpvoted={upvote.isUpvoted()}
										upvoteDisabled={upvote.isDisabled()}
										onUpvote={upvote.toggle}
										tags={tags()}
									/>
								);
							}}
						</For>
					</div>

					{/* Pagination controls */}
					<Show when={totalPages() > 1}>
						<Flex justify="between" align="center" class="mt-2">
							<Text size="sm" color="muted">
								Page {props.page + 1} of {totalPages()}
							</Text>
							<Flex gap="sm" align="center">
								<Button
									variant="outline"
									size="sm"
									disabled={props.page === 0}
									onClick={() => props.onPageChange(props.page - 1)}
								>
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={props.page >= totalPages() - 1}
									onClick={() => props.onPageChange(props.page + 1)}
								>
									Next
								</Button>
							</Flex>
						</Flex>
					</Show>
				</Stack>
			</Match>
		</Switch>
	);
};

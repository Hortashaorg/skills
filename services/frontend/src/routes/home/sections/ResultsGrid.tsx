import type { Row } from "@package/database/client";
import { For, Show } from "solid-js";
import { PackageCard } from "@/components/feature/package-card";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Button } from "@/components/ui/button";
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
}

export const ResultsGrid = (props: ResultsGridProps) => {
	const totalPages = () => Math.ceil(props.totalCount / props.pageSize);
	const startIndex = () => props.page * props.pageSize + 1;
	const endIndex = () =>
		Math.min((props.page + 1) * props.pageSize, props.totalCount);

	return (
		<Show when={props.totalCount > 0}>
			<Stack spacing="sm">
				<Text size="sm" color="muted">
					Showing {startIndex()}-{endIndex()} of {props.totalCount} result
					{props.totalCount !== 1 ? "s" : ""}
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
										): pt is typeof pt & { tag: NonNullable<typeof pt.tag> } =>
											!!pt.tag,
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
		</Show>
	);
};

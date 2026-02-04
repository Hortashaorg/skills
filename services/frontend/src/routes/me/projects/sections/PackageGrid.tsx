import { For, Show } from "solid-js";
import { PackageCard } from "@/components/feature/package-card";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
import { createPackageUpvote } from "@/hooks/packages";
import { buildPackageUrl } from "@/lib/url";

type PackageWithUpvotes = {
	id: string;
	name: string;
	registry: string;
	description?: string | null;
	upvotes?: readonly { id: string; accountId: string }[];
};

type PackagesByTag<T> = {
	groups: Record<string, T[]>;
	sortedTags: string[];
	uncategorized: T[];
};

type PackageGridProps<T extends PackageWithUpvotes> = {
	packages: readonly T[];
	packagesByTag: PackagesByTag<T>;
	isOwner: boolean;
	onRemove: (packageId: string) => void;
};

const PackageGridItem = <T extends PackageWithUpvotes>(props: {
	pkg: T;
	isOwner: boolean;
	onRemove: () => void;
}) => {
	const upvote = createPackageUpvote(() => props.pkg);

	return (
		<PackageCard
			name={props.pkg.name}
			registry={props.pkg.registry}
			description={props.pkg.description}
			href={buildPackageUrl(props.pkg.registry, props.pkg.name)}
			upvoteCount={upvote.upvoteCount()}
			isUpvoted={upvote.isUpvoted()}
			upvoteDisabled={upvote.isDisabled()}
			onUpvote={upvote.toggle}
			onRemove={props.isOwner ? props.onRemove : undefined}
		/>
	);
};

export const PackageGrid = <T extends PackageWithUpvotes>(
	props: PackageGridProps<T>,
) => {
	return (
		<Show
			when={props.packages.length > 0}
			fallback={
				<Card padding="lg">
					<Stack spacing="sm" align="center">
						<Text color="muted">No packages in this project yet.</Text>
						<Show
							when={props.isOwner}
							fallback={
								<Text size="sm" color="muted">
									The owner can add packages to this project.
								</Text>
							}
						>
							<Text size="sm" color="muted">
								Use the search above to add packages.
							</Text>
						</Show>
					</Stack>
				</Card>
			}
		>
			<Stack spacing="lg">
				{/* Tagged sections */}
				<For each={props.packagesByTag.sortedTags}>
					{(tagName) => (
						<Stack spacing="sm">
							<Heading level="h3">{tagName}</Heading>
							<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								<For each={props.packagesByTag.groups[tagName]}>
									{(pkg) => (
										<PackageGridItem
											pkg={pkg}
											isOwner={props.isOwner}
											onRemove={() => props.onRemove(pkg.id)}
										/>
									)}
								</For>
							</div>
						</Stack>
					)}
				</For>

				{/* Uncategorized section */}
				<Show when={props.packagesByTag.uncategorized.length > 0}>
					<Stack spacing="sm">
						<Heading level="h3">Uncategorized</Heading>
						<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							<For each={props.packagesByTag.uncategorized}>
								{(pkg) => (
									<PackageGridItem
										pkg={pkg}
										isOwner={props.isOwner}
										onRemove={() => props.onRemove(pkg.id)}
									/>
								)}
							</For>
						</div>
					</Stack>
				</Show>
			</Stack>
		</Show>
	);
};

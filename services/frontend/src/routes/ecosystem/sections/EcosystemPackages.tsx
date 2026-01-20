import { For, Show } from "solid-js";
import { ActionCard } from "@/components/composite/action-card";
import { PackageCard } from "@/components/feature/package-card";
import { Heading } from "@/components/primitives/heading";
import { PlusIcon } from "@/components/primitives/icon";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
import { createPackageUpvote } from "@/hooks/createPackageUpvote";
import { buildPackageUrl } from "@/lib/url";

type PackageWithUpvotes = {
	id: string;
	name: string;
	registry: string;
	description?: string | null;
	latestVersion?: string | null;
	upvotes?: readonly { id: string; accountId: string }[];
	packageTags?: readonly { tagId: string; tag?: { name: string } | null }[];
};

export interface PackagesByTag<T> {
	groups: Record<string, T[]>;
	sortedTags: string[];
	uncategorized: T[];
}

interface EcosystemPackagesProps<T extends PackageWithUpvotes> {
	packages: readonly T[];
	packagesByTag: PackagesByTag<T>;
	onSuggestPackage: () => void;
}

const PackageGridItem = <T extends PackageWithUpvotes>(props: { pkg: T }) => {
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
		/>
	);
};

const SuggestPackageCard = (props: { onClick: () => void }) => (
	<ActionCard
		icon={<PlusIcon size="sm" class="text-primary dark:text-primary-dark" />}
		title="Suggest Package"
		description="Add a package to this ecosystem"
		onClick={props.onClick}
	/>
);

export const EcosystemPackages = <T extends PackageWithUpvotes>(
	props: EcosystemPackagesProps<T>,
) => {
	const hasPackages = () => props.packages.length > 0;
	const hasGroupedPackages = () =>
		props.packagesByTag.sortedTags.length > 0 ||
		props.packagesByTag.uncategorized.length > 0;

	return (
		<Stack spacing="lg">
			<Show
				when={hasGroupedPackages()}
				fallback={
					<Show
						when={!hasPackages()}
						fallback={
							<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								<For each={[...props.packages]}>
									{(pkg) => <PackageGridItem pkg={pkg} />}
								</For>
								<SuggestPackageCard onClick={props.onSuggestPackage} />
							</div>
						}
					>
						<Card padding="lg">
							<Stack spacing="md" align="center">
								<Text color="muted">No packages in this ecosystem yet.</Text>
								<Text size="sm" color="muted">
									Be the first to suggest one!
								</Text>
								<SuggestPackageCard onClick={props.onSuggestPackage} />
							</Stack>
						</Card>
					</Show>
				}
			>
				<For each={props.packagesByTag.sortedTags}>
					{(tagName) => (
						<Stack spacing="sm">
							<Heading level="h3">{tagName}</Heading>
							<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								<For each={props.packagesByTag.groups[tagName]}>
									{(pkg) => <PackageGridItem pkg={pkg} />}
								</For>
							</div>
						</Stack>
					)}
				</For>

				<Show when={props.packagesByTag.uncategorized.length > 0}>
					<Stack spacing="sm">
						<Heading level="h3">Other</Heading>
						<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							<For each={props.packagesByTag.uncategorized}>
								{(pkg) => <PackageGridItem pkg={pkg} />}
							</For>
							<SuggestPackageCard onClick={props.onSuggestPackage} />
						</div>
					</Stack>
				</Show>

				<Show when={props.packagesByTag.uncategorized.length === 0}>
					<Stack spacing="sm">
						<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							<SuggestPackageCard onClick={props.onSuggestPackage} />
						</div>
					</Stack>
				</Show>
			</Show>
		</Stack>
	);
};

export function groupPackagesByTag<T extends PackageWithUpvotes>(
	packages: readonly T[],
): PackagesByTag<T> {
	const groups: Record<string, T[]> = {};
	const uncategorized: T[] = [];

	for (const pkg of packages) {
		const tags = pkg.packageTags ?? [];
		if (tags.length === 0) {
			uncategorized.push(pkg);
		} else {
			for (const pt of tags) {
				const tagName = pt.tag?.name;
				if (tagName) {
					if (!groups[tagName]) {
						groups[tagName] = [];
					}
					groups[tagName].push(pkg);
				}
			}
		}
	}

	const sortedTags = Object.keys(groups).sort((a, b) =>
		a.toLowerCase().localeCompare(b.toLowerCase()),
	);

	return { groups, sortedTags, uncategorized };
}

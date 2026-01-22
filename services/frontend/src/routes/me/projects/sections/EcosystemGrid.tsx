import { For, Show } from "solid-js";
import { EcosystemCard } from "@/components/feature/ecosystem-card";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
import { createEcosystemUpvote } from "@/hooks/createEcosystemUpvote";

type EcosystemWithUpvotes = {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
	upvotes?: readonly { id: string; accountId: string }[];
	ecosystemTags?: readonly { tagId: string; tag?: { name: string } | null }[];
};

type EcosystemsByTag<T> = {
	groups: Record<string, T[]>;
	sortedTags: string[];
	uncategorized: T[];
};

type EcosystemGridProps<T extends EcosystemWithUpvotes> = {
	ecosystems: readonly T[];
	ecosystemsByTag: EcosystemsByTag<T>;
	isOwner: boolean;
	onRemove: (ecosystemId: string) => void;
};

const EcosystemGridItem = <T extends EcosystemWithUpvotes>(props: {
	ecosystem: T;
	isOwner: boolean;
	onRemove: () => void;
}) => {
	const upvote = createEcosystemUpvote(() => props.ecosystem);

	return (
		<EcosystemCard
			name={props.ecosystem.name}
			description={props.ecosystem.description}
			href={`/ecosystem/${props.ecosystem.slug}`}
			upvoteCount={upvote.upvoteCount()}
			isUpvoted={upvote.isUpvoted()}
			upvoteDisabled={upvote.isDisabled()}
			onUpvote={upvote.toggle}
			onRemove={props.isOwner ? props.onRemove : undefined}
		/>
	);
};

export const EcosystemGrid = <T extends EcosystemWithUpvotes>(
	props: EcosystemGridProps<T>,
) => {
	return (
		<Show
			when={props.ecosystems.length > 0}
			fallback={
				<Card padding="lg">
					<Stack spacing="sm" align="center">
						<Text color="muted">No ecosystems in this project yet.</Text>
						<Show
							when={props.isOwner}
							fallback={
								<Text size="sm" color="muted">
									The owner can add ecosystems to this project.
								</Text>
							}
						>
							<Text size="sm" color="muted">
								Use the search above to add ecosystems.
							</Text>
						</Show>
					</Stack>
				</Card>
			}
		>
			<Stack spacing="lg">
				{/* Tagged sections */}
				<For each={props.ecosystemsByTag.sortedTags}>
					{(tagName) => (
						<Stack spacing="sm">
							<Heading level="h3">{tagName}</Heading>
							<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								<For each={props.ecosystemsByTag.groups[tagName]}>
									{(eco) => (
										<EcosystemGridItem
											ecosystem={eco}
											isOwner={props.isOwner}
											onRemove={() => props.onRemove(eco.id)}
										/>
									)}
								</For>
							</div>
						</Stack>
					)}
				</For>

				{/* Uncategorized section */}
				<Show when={props.ecosystemsByTag.uncategorized.length > 0}>
					<Stack spacing="sm">
						<Heading level="h3">Uncategorized</Heading>
						<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							<For each={props.ecosystemsByTag.uncategorized}>
								{(eco) => (
									<EcosystemGridItem
										ecosystem={eco}
										isOwner={props.isOwner}
										onRemove={() => props.onRemove(eco.id)}
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

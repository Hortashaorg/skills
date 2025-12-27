import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UpvoteButton } from "@/components/ui/upvote-button";

export interface PackageTag {
	name: string;
	slug: string;
}

export interface PackageCardProps {
	name: string;
	registry: string;
	description?: string | null;
	href: string;
	upvoteCount: number;
	isUpvoted: boolean;
	upvoteDisabled: boolean;
	onUpvote: () => void;
	tags?: readonly PackageTag[];
}

const MAX_VISIBLE_TAGS = 3;

export const PackageCard = (props: PackageCardProps) => {
	return (
		<Card
			padding="md"
			class="h-full hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition-colors"
		>
			<div class="flex flex-col h-full gap-1">
				{/* Header */}
				<Flex gap="sm" align="center" justify="between">
					<A href={props.href} class="flex items-center gap-2 min-w-0 flex-1">
						<Text
							weight="semibold"
							class="text-on-surface dark:text-on-surface-dark truncate"
						>
							{props.name}
						</Text>
						<Badge variant="secondary" size="sm">
							{props.registry}
						</Badge>
					</A>
					<UpvoteButton
						count={props.upvoteCount}
						isUpvoted={props.isUpvoted}
						disabled={props.upvoteDisabled}
						onClick={props.onUpvote}
					/>
				</Flex>

				{/* Description - grows to fill space */}
				<Show when={props.description}>
					<A href={props.href} class="flex-1">
						<Text size="sm" color="muted" class="line-clamp-2">
							{props.description}
						</Text>
					</A>
				</Show>

				{/* Tags - stick to bottom */}
				<Show when={props.tags && props.tags.length > 0}>
					<Flex gap="xs" align="center" class="flex-wrap mt-auto pt-2">
						<For each={props.tags?.slice(0, MAX_VISIBLE_TAGS)}>
							{(tag) => (
								<Badge variant="info" size="sm">
									{tag.name}
								</Badge>
							)}
						</For>
						<Show when={(props.tags?.length ?? 0) > MAX_VISIBLE_TAGS}>
							<Text size="xs" color="muted">
								+{(props.tags?.length ?? 0) - MAX_VISIBLE_TAGS} more
							</Text>
						</Show>
					</Flex>
				</Show>
			</div>
		</Card>
	);
};

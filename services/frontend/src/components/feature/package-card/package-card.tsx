import { A } from "@solidjs/router";
import { Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UpvoteButton } from "@/components/ui/upvote-button";

export interface PackageCardProps {
	name: string;
	registry: string;
	description?: string | null;
	href: string;
	upvoteCount: number;
	isUpvoted: boolean;
	upvoteDisabled: boolean;
	onUpvote: () => void;
}

export const PackageCard = (props: PackageCardProps) => {
	return (
		<Card
			padding="md"
			class="h-full hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition-colors"
		>
			<Stack spacing="xs">
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
				<Show when={props.description}>
					<A href={props.href}>
						<Text size="sm" color="muted" class="line-clamp-2">
							{props.description}
						</Text>
					</A>
				</Show>
			</Stack>
		</Card>
	);
};

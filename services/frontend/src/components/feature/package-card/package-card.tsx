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
	/** Status badge for failed/placeholder packages */
	status?: "failed" | "placeholder";
	/** Failure reason to show */
	failureReason?: string | null;
	/** Version range to display */
	versionRange?: string;
}

const MAX_VISIBLE_TAGS = 3;

export const PackageCard = (props: PackageCardProps) => {
	const hasStatus = () => props.status === "failed" || props.status === "placeholder";
	const hasTags = () => props.tags && props.tags.length > 0;
	const hasFooter = () => hasTags() || props.versionRange || hasStatus();

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

				{/* Footer: Tags, version range, and status */}
				<Show when={hasFooter()}>
					<Flex gap="xs" align="center" justify="between" class="flex-wrap mt-auto pt-2">
						{/* Left side: Tags */}
						<Flex gap="xs" align="center" class="flex-wrap">
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

						{/* Right side: Version range and status */}
						<Flex gap="xs" align="center">
							<Show when={props.versionRange}>
								<Badge variant="secondary" size="sm">
									{props.versionRange}
								</Badge>
							</Show>
							<Show when={props.status === "placeholder"}>
								<Badge variant="warning" size="sm">
									not fetched
								</Badge>
							</Show>
							<Show when={props.status === "failed"}>
								<Badge variant="danger" size="sm">
									{props.failureReason || "failed"}
								</Badge>
							</Show>
						</Flex>
					</Flex>
				</Show>
			</div>
		</Card>
	);
};

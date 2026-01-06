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
	/** Called when remove button is clicked. Button only shown when provided. */
	onRemove?: () => void;
}

const MAX_VISIBLE_TAGS = 3;

export const PackageCard = (props: PackageCardProps) => {
	const hasStatus = () =>
		props.status === "failed" || props.status === "placeholder";
	const hasTags = () => props.tags && props.tags.length > 0;
	const hasFooter = () => hasTags() || props.versionRange || hasStatus();

	return (
		<Card
			padding="md"
			class="relative h-full hover:bg-surface-alt dark:hover:bg-surface-dark-alt has-[[data-upvote]:hover]:bg-transparent dark:has-[[data-upvote]:hover]:bg-transparent transition-colors"
		>
			{/* Stretched link - covers entire card */}
			<A
				href={props.href}
				class="absolute inset-0"
				aria-hidden="true"
				tabIndex={-1}
			/>

			<div class="relative pointer-events-none flex flex-col h-full gap-1">
				{/* Header */}
				<Flex gap="sm" align="center" justify="between">
					<div class="flex items-center gap-2 min-w-0 flex-1">
						<Text
							weight="semibold"
							class="text-on-surface dark:text-on-surface-dark truncate"
						>
							{props.name}
						</Text>
						<Badge variant="secondary" size="sm">
							{props.registry}
						</Badge>
					</div>
					<Flex gap="xs" align="center" class="pointer-events-auto" data-upvote>
						<UpvoteButton
							count={props.upvoteCount}
							isUpvoted={props.isUpvoted}
							disabled={props.upvoteDisabled}
							onClick={props.onUpvote}
						/>
						<Show when={props.onRemove}>
							<button
								type="button"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									props.onRemove?.();
								}}
								class="p-1.5 rounded text-on-surface-muted dark:text-on-surface-dark-muted hover:text-danger dark:hover:text-danger-dark hover:bg-danger/10 dark:hover:bg-danger-dark/10 transition"
								title="Remove"
							>
								<svg
									class="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<title>Remove</title>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</Show>
					</Flex>
				</Flex>

				{/* Description - grows to fill space */}
				<Show when={props.description}>
					<Text size="sm" color="muted" class="line-clamp-2 flex-1">
						{props.description}
					</Text>
				</Show>

				{/* Footer: Tags, version range, and status */}
				<Show when={hasFooter()}>
					<Flex
						gap="xs"
						align="center"
						justify="between"
						class="flex-wrap mt-auto pt-2"
					>
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

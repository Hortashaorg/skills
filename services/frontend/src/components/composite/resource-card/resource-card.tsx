import { A } from "@solidjs/router";
import { cva, type VariantProps } from "class-variance-authority";
import { For, type JSX, Show, splitProps } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UpvoteButton } from "@/components/ui/upvote-button";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_TAGS = 3;

export interface ResourceTag {
	name: string;
	slug: string;
}

const resourceCardVariants = cva(
	[
		"relative",
		"h-full",
		"transition-colors",
		"hover:bg-surface-alt",
		"dark:hover:bg-surface-dark-alt",
		"has-[[data-upvote]:hover]:bg-transparent",
		"dark:has-[[data-upvote]:hover]:bg-transparent",
	],
	{
		variants: {
			status: {
				default: [],
				pending: ["border-dashed", "hover:bg-transparent"],
				failed: [],
			},
		},
		defaultVariants: {
			status: "default",
		},
	},
);

export type ResourceCardProps = VariantProps<typeof resourceCardVariants> & {
	name: string;
	href: string;
	description?: string | null;
	badge?: string;
	tags?: readonly ResourceTag[];
	footer?: JSX.Element;
	upvoteCount: number;
	isUpvoted: boolean;
	upvoteDisabled: boolean;
	onUpvote: () => void;
	failureReason?: string | null;
	onRemove?: () => void;
	class?: string;
};

export const ResourceCard = (props: ResourceCardProps) => {
	const [local, others] = splitProps(props, [
		"name",
		"href",
		"description",
		"badge",
		"tags",
		"footer",
		"upvoteCount",
		"isUpvoted",
		"upvoteDisabled",
		"onUpvote",
		"status",
		"failureReason",
		"onRemove",
		"class",
	]);

	const isPending = () => local.status === "pending";
	const isFailed = () => local.status === "failed";
	const hasTags = () => local.tags && local.tags.length > 0;
	const hasFooter = () => hasTags() || local.footer || isFailed();

	return (
		<Card
			padding="md"
			class={cn(resourceCardVariants({ status: local.status }), local.class)}
			{...others}
		>
			{/* Stretched link - covers entire card (not for pending) */}
			<Show when={!isPending()}>
				<A
					href={local.href}
					class="absolute inset-0"
					aria-hidden="true"
					tabIndex={-1}
				/>
			</Show>

			<div class="relative pointer-events-none flex flex-col h-full gap-1">
				{/* Header */}
				<Flex gap="sm" align="center" justify="between">
					<div class="flex items-center gap-2 min-w-0 flex-1">
						<Text
							weight="semibold"
							class="text-on-surface dark:text-on-surface-dark truncate"
						>
							{local.name}
						</Text>
						<Show when={local.badge}>
							<Badge variant="secondary" size="sm">
								{local.badge}
							</Badge>
						</Show>
						<Show when={isPending()}>
							<Badge variant="warning" size="sm">
								Pending
							</Badge>
						</Show>
					</div>
					<Show when={!isPending()}>
						<Flex
							gap="xs"
							align="center"
							class="pointer-events-auto"
							data-upvote
						>
							<UpvoteButton
								count={local.upvoteCount}
								isUpvoted={local.isUpvoted}
								disabled={local.upvoteDisabled}
								onClick={local.onUpvote}
							/>
							<Show when={local.onRemove}>
								<button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										local.onRemove?.();
									}}
									class="p-1.5 rounded text-on-surface-muted dark:text-on-surface-dark-muted hover:text-danger dark:hover:text-danger hover:bg-danger/10 dark:hover:bg-danger/10 transition"
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
					</Show>
				</Flex>

				{/* Description - grows to fill space */}
				<Show when={local.description}>
					<Text size="sm" color="muted" class="line-clamp-2 flex-1">
						{local.description}
					</Text>
				</Show>

				{/* Footer: Tags, custom footer content, and status */}
				<Show when={hasFooter()}>
					<Flex
						gap="xs"
						align="center"
						justify="between"
						class="flex-wrap mt-auto pt-2"
					>
						{/* Left side: Tags */}
						<Flex gap="xs" align="center" class="flex-wrap">
							<For each={local.tags?.slice(0, MAX_VISIBLE_TAGS)}>
								{(tag) => (
									<Badge variant="info" size="sm">
										{tag.name}
									</Badge>
								)}
							</For>
							<Show when={(local.tags?.length ?? 0) > MAX_VISIBLE_TAGS}>
								<Text size="xs" color="muted">
									+{(local.tags?.length ?? 0) - MAX_VISIBLE_TAGS} more
								</Text>
							</Show>
						</Flex>

						{/* Right side: Custom footer and status */}
						<Flex gap="xs" align="center">
							<Show when={local.footer}>{local.footer}</Show>
							<Show when={isPending()}>
								<Text size="xs" color="muted">
									Awaiting approval
								</Text>
							</Show>
							<Show when={isFailed()}>
								<Badge variant="danger" size="sm">
									{local.failureReason || "failed"}
								</Badge>
							</Show>
						</Flex>
					</Flex>
				</Show>
			</div>
		</Card>
	);
};

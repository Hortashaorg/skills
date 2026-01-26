import { A } from "@solidjs/router";
import { cva, type VariantProps } from "class-variance-authority";
import { For, type JSX, Show, splitProps } from "solid-js";
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
		"has-[[data-remove]:hover]:bg-transparent",
		"dark:has-[[data-remove]:hover]:bg-transparent",
	],
	{
		variants: {
			status: {
				default: [],
				pending: ["border-dashed"],
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

	return (
		<Card
			padding="md"
			class={cn(resourceCardVariants({ status: local.status }), local.class)}
			{...others}
		>
			<A
				href={local.href}
				class="absolute inset-0"
				tabIndex={-1}
				aria-label={`View ${local.name}`}
			/>

			{/* Remove button: top-right corner */}
			<Show when={local.onRemove}>
				<div class="absolute top-2 right-2 z-10" data-remove>
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							local.onRemove?.();
						}}
						class="p-1 rounded cursor-pointer text-on-surface-muted dark:text-on-surface-dark-muted hover:text-danger dark:hover:text-danger hover:bg-danger/10 dark:hover:bg-danger/10 transition"
						title="Remove"
					>
						<svg
							class="w-3.5 h-3.5"
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
				</div>
			</Show>

			<div class="relative pointer-events-none flex flex-col h-full gap-1.5">
				{/* Title + status badges */}
				<div class="flex flex-col gap-0.5">
					<Text
						weight="semibold"
						class={cn(
							"text-on-surface dark:text-on-surface-dark truncate",
							local.onRemove && "pr-6",
						)}
					>
						{local.name}
					</Text>

					<Show when={isPending() || isFailed()}>
						<div class="flex items-center gap-1.5">
							<Show when={isPending()}>
								<Badge variant="warning" size="sm">
									Pending
								</Badge>
							</Show>
							<Show when={isFailed()}>
								<Badge variant="danger" size="sm">
									{local.failureReason || "failed"}
								</Badge>
							</Show>
						</div>
					</Show>
				</div>

				{/* Description */}
				<Show when={local.description}>
					<Text size="sm" color="muted" class="line-clamp-2 flex-1">
						{local.description}
					</Text>
				</Show>

				{/* Footer: badge + tags + custom left, upvote right */}
				<div class="flex items-end justify-between gap-2 mt-auto pt-1">
					<div class="flex items-center gap-1.5 flex-wrap min-w-0">
						<Show when={local.badge}>
							<Badge variant="subtle" size="sm">
								{local.badge}
							</Badge>
						</Show>
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
						<Show when={local.footer}>{local.footer}</Show>
					</div>

					<div
						class="flex items-center shrink-0 pointer-events-auto"
						data-upvote
					>
						<UpvoteButton
							count={local.upvoteCount}
							isUpvoted={local.isUpvoted}
							disabled={local.upvoteDisabled}
							onClick={local.onUpvote}
						/>
					</div>
				</div>
			</div>
		</Card>
	);
};

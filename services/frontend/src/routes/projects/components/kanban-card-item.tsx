import { For, Show } from "solid-js";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UpvoteButton } from "@/components/ui/upvote-button";
import type { KanbanCard } from "../types";

const MAX_VISIBLE_TAGS = 3;

type KanbanCardItemProps = {
	card: KanbanCard;
	columnId: string;
	readonly?: boolean;
	upvoteDisabled?: boolean;
	isDragging?: boolean;
	draggableProps?: Record<string, unknown>;
	wasDragged?: () => boolean;
	onCardClick?: (card: KanbanCard, columnId: string) => void;
	onUpvote?: (card: KanbanCard) => void;
	onRemove?: (card: KanbanCard) => void;
};

export const KanbanCardItem = (props: KanbanCardItemProps) => {
	return (
		<div
			{...(props.draggableProps ?? {})}
			class={`transition-opacity ${props.isDragging ? "opacity-40" : ""}`}
		>
			<Card
				padding="sm"
				class={`relative hover:shadow-md transition-shadow ${props.readonly ? "cursor-default" : "cursor-pointer active:cursor-grabbing"}`}
				onClick={() => {
					if (!props.wasDragged?.()) {
						props.onCardClick?.(props.card, props.columnId);
					}
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						props.onCardClick?.(props.card, props.columnId);
					}
				}}
				role="button"
				tabIndex={0}
			>
				<Show when={!props.readonly && props.onRemove}>
					<div class="absolute top-2 right-2 z-10">
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								props.onRemove?.(props.card);
							}}
							class="p-1 rounded cursor-pointer text-on-surface-muted dark:text-on-surface-dark-muted hover:text-danger dark:hover:text-danger hover:bg-danger/10 dark:hover:bg-danger/10 transition"
							title="Remove"
						>
							<svg
								class="h-3.5 w-3.5"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								viewBox="0 0 24 24"
							>
								<title>Remove</title>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				</Show>

				<Stack spacing="xs">
					<div class="flex items-center gap-1.5">
						<Badge
							variant={props.card.kind === "package" ? "primary" : "secondary"}
							size="sm"
						>
							{props.card.kind === "package" ? "pkg" : "eco"}
						</Badge>
						<Text
							weight="semibold"
							size="sm"
							class={`truncate ${!props.readonly && props.onRemove ? "pr-5" : ""}`}
						>
							{props.card.name}
						</Text>
					</div>

					<Show when={props.card.description}>
						<Text size="sm" color="muted" class="line-clamp-2">
							{props.card.description}
						</Text>
					</Show>
				</Stack>

				<div class="flex items-end justify-between gap-2 mt-2">
					<div class="flex items-center gap-1 flex-wrap min-w-0">
						<Show when={props.card.registry}>
							<Badge variant="subtle" size="sm">
								{props.card.registry}
							</Badge>
						</Show>
						<For each={props.card.tags.slice(0, MAX_VISIBLE_TAGS)}>
							{(tag) => (
								<Badge variant="info" size="sm">
									{tag}
								</Badge>
							)}
						</For>
						<Show when={props.card.tags.length > MAX_VISIBLE_TAGS}>
							<Text size="sm" color="muted">
								+{props.card.tags.length - MAX_VISIBLE_TAGS}
							</Text>
						</Show>
					</div>
					{/* biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation wrapper, not interactive */}
					{/* biome-ignore lint/a11y/noStaticElementInteractions: stopPropagation wrapper, not interactive */}
					<div class="shrink-0" onClick={(e) => e.stopPropagation()}>
						<UpvoteButton
							count={props.card.upvoteCount}
							isUpvoted={props.card.isUpvoted}
							disabled={props.upvoteDisabled}
							onClick={() => props.onUpvote?.(props.card)}
							size="sm"
						/>
					</div>
				</div>
			</Card>
		</div>
	);
};

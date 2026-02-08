import { Popover } from "@kobalte/core/popover";
import type { ProjectStatus } from "@package/database/client";
import { For, Show } from "solid-js";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UpvoteButton } from "@/components/ui/upvote-button";
import { createDragAndDrop } from "@/hooks/useDragAndDrop";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_TAGS = 3;

export type KanbanCard = {
	id: string;
	entityId: string;
	name: string;
	description?: string;
	tags: string[];
	kind: "package" | "ecosystem";
	registry?: string;
	upvoteCount: number;
	isUpvoted: boolean;
};

export type KanbanColumn = {
	id: ProjectStatus;
	statusRecordId?: string;
	label: string;
	cards: KanbanCard[];
};

type KanbanBoardProps = {
	columns: KanbanColumn[];
	readonly?: boolean;
	upvoteDisabled?: boolean;
	availableStatuses?: ProjectStatus[];
	statusLabels?: Record<ProjectStatus, string>;
	onCardMove?: (
		cardId: string,
		fromColumnId: string,
		toColumnId: string,
	) => void;
	onCardClick?: (card: KanbanCard, columnId: string) => void;
	onUpvote?: (card: KanbanCard) => void;
	onRemove?: (card: KanbanCard) => void;
	onMoveColumn?: (columnId: string, direction: "left" | "right") => void;
	onAddStatus?: (status: ProjectStatus) => void;
	onRemoveColumn?: (columnId: string) => void;
	ref?: (el: HTMLElement) => void;
};

const statusColors: Record<ProjectStatus, string> = {
	aware: "border-t-outline dark:border-t-outline-dark",
	evaluating: "border-t-info",
	trialing: "border-t-info",
	approved: "border-t-success",
	adopted: "border-t-success",
	rejected: "border-t-danger",
	phasing_out: "border-t-warning",
	dropped: "border-t-danger",
};

export const KanbanBoard = (props: KanbanBoardProps) => {
	const dnd = createDragAndDrop({
		onDrop: (itemId, from, to) => props.onCardMove?.(itemId, from, to),
	});

	return (
		<div ref={(el) => props.ref?.(el)} class="flex gap-4 overflow-x-auto pb-4">
			<For each={props.columns}>
				{(column, index) => (
					<div
						{...(props.readonly ? {} : dnd.droppable(column.id))}
						class={`w-88 shrink-0 rounded-lg border-t-4 ${statusColors[column.id]} p-3 transition-colors ${
							!props.readonly && dnd.isOver(column.id)
								? "bg-primary/5 dark:bg-primary-dark/10 ring-2 ring-primary/30 dark:ring-primary-dark/30"
								: "bg-surface dark:bg-surface-dark"
						}`}
					>
						<div class="mb-3 flex items-center justify-between gap-1">
							<div class="flex items-center gap-1 min-w-0">
								<Show
									when={!props.readonly && props.onMoveColumn && index() > 0}
								>
									<button
										type="button"
										onClick={() => props.onMoveColumn?.(column.id, "left")}
										class="p-0.5 rounded cursor-pointer text-on-surface-muted dark:text-on-surface-dark-muted hover:text-on-surface dark:hover:text-on-surface-dark hover:bg-surface-raised dark:hover:bg-surface-raised-dark transition"
										title="Move left"
									>
										<svg
											class="h-3.5 w-3.5"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											viewBox="0 0 24 24"
										>
											<title>Move left</title>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M15 19l-7-7 7-7"
											/>
										</svg>
									</button>
								</Show>
								<Heading level="h3" class="text-sm truncate">
									{column.label}
								</Heading>
								<Show
									when={
										!props.readonly &&
										props.onMoveColumn &&
										index() < props.columns.length - 1
									}
								>
									<button
										type="button"
										onClick={() => props.onMoveColumn?.(column.id, "right")}
										class="p-0.5 rounded cursor-pointer text-on-surface-muted dark:text-on-surface-dark-muted hover:text-on-surface dark:hover:text-on-surface-dark hover:bg-surface-raised dark:hover:bg-surface-raised-dark transition"
										title="Move right"
									>
										<svg
											class="h-3.5 w-3.5"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											viewBox="0 0 24 24"
										>
											<title>Move right</title>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</button>
								</Show>
							</div>
							<div class="flex items-center gap-1">
								<Text size="sm" color="muted">
									{column.cards.length}
								</Text>
								<Show
									when={
										!props.readonly &&
										props.onRemoveColumn &&
										column.cards.length === 0
									}
								>
									<button
										type="button"
										onClick={() => props.onRemoveColumn?.(column.id)}
										class="p-0.5 rounded cursor-pointer text-on-surface-muted dark:text-on-surface-dark-muted hover:text-danger dark:hover:text-danger hover:bg-danger/10 dark:hover:bg-danger/10 transition"
										title="Remove column"
									>
										<svg
											class="h-3.5 w-3.5"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											viewBox="0 0 24 24"
										>
											<title>Remove column</title>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</Show>
							</div>
						</div>
						<Stack spacing="sm">
							<For each={column.cards}>
								{(card) => (
									<div
										{...(props.readonly
											? {}
											: dnd.draggable(card.id, column.id))}
										class={`transition-opacity ${
											!props.readonly && dnd.isDragging(card.id)
												? "opacity-40"
												: ""
										}`}
									>
										<Card
											padding="sm"
											class={`relative hover:shadow-md transition-shadow ${props.readonly ? "cursor-default" : "cursor-pointer active:cursor-grabbing"}`}
											onClick={() => {
												if (!dnd.wasDragged()) {
													props.onCardClick?.(card, column.id);
												}
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													props.onCardClick?.(card, column.id);
												}
											}}
											role="button"
											tabIndex={0}
										>
											{/* Remove button */}
											<Show when={!props.readonly && props.onRemove}>
												<div class="absolute top-2 right-2 z-10">
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															props.onRemove?.(card);
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
												{/* Title row */}
												<div class="flex items-center gap-1.5">
													<Badge
														variant={
															card.kind === "package" ? "primary" : "secondary"
														}
														size="sm"
													>
														{card.kind === "package" ? "pkg" : "eco"}
													</Badge>
													<Text
														weight="semibold"
														size="sm"
														class={`truncate ${!props.readonly && props.onRemove ? "pr-5" : ""}`}
													>
														{card.name}
													</Text>
												</div>

												{/* Description */}
												<Show when={card.description}>
													<Text size="sm" color="muted" class="line-clamp-2">
														{card.description}
													</Text>
												</Show>
											</Stack>

											{/* Footer: tags + registry + upvote */}
											<div class="flex items-end justify-between gap-2 mt-2">
												<div class="flex items-center gap-1 flex-wrap min-w-0">
													<Show when={card.registry}>
														<Badge variant="subtle" size="sm">
															{card.registry}
														</Badge>
													</Show>
													<For each={card.tags.slice(0, MAX_VISIBLE_TAGS)}>
														{(tag) => (
															<Badge variant="info" size="sm">
																{tag}
															</Badge>
														)}
													</For>
													<Show when={card.tags.length > MAX_VISIBLE_TAGS}>
														<Text size="sm" color="muted">
															+{card.tags.length - MAX_VISIBLE_TAGS}
														</Text>
													</Show>
												</div>
												{/* biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation wrapper, not interactive */}
												{/* biome-ignore lint/a11y/noStaticElementInteractions: stopPropagation wrapper, not interactive */}
												<div
													class="shrink-0"
													onClick={(e) => e.stopPropagation()}
												>
													<UpvoteButton
														count={card.upvoteCount}
														isUpvoted={card.isUpvoted}
														disabled={props.upvoteDisabled}
														onClick={() => props.onUpvote?.(card)}
														size="sm"
													/>
												</div>
											</div>
										</Card>
									</div>
								)}
							</For>
						</Stack>
					</div>
				)}
			</For>

			{/* Add Status button */}
			<Show
				when={
					!props.readonly &&
					props.onAddStatus &&
					(props.availableStatuses?.length ?? 0) > 0
				}
			>
				<div class="shrink-0">
					<Popover>
						<Popover.Trigger
							class={cn(
								"h-8 w-8 flex items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition",
								"border-outline dark:border-outline-dark",
								"text-on-surface-muted dark:text-on-surface-dark-muted",
								"hover:border-primary dark:hover:border-primary-dark",
								"hover:text-primary dark:hover:text-primary-dark",
							)}
							title="Add status column"
						>
							<svg
								class="h-4 w-4"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								viewBox="0 0 24 24"
							>
								<title>Add status</title>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 4v16m8-8H4"
								/>
							</svg>
						</Popover.Trigger>
						<Popover.Portal>
							<Popover.Content
								class={cn(
									"z-50 w-48 rounded-radius border shadow-lg p-1",
									"border-outline dark:border-outline-dark",
									"bg-surface dark:bg-surface-dark",
									"ui-expanded:animate-in ui-expanded:fade-in-0 ui-expanded:zoom-in-95",
									"ui-closed:animate-out ui-closed:fade-out-0 ui-closed:zoom-out-95",
								)}
							>
								<For each={props.availableStatuses}>
									{(status) => (
										<Popover.CloseButton
											class={cn(
												"w-full text-left px-3 py-1.5 rounded-sm cursor-pointer text-sm transition-colors",
												"text-on-surface dark:text-on-surface-dark",
												"hover:bg-surface-alt dark:hover:bg-surface-dark-alt",
											)}
											onClick={() => props.onAddStatus?.(status)}
										>
											{props.statusLabels?.[status] ?? status}
										</Popover.CloseButton>
									)}
								</For>
							</Popover.Content>
						</Popover.Portal>
					</Popover>
				</div>
			</Show>
		</div>
	);
};

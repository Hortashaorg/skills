import type { ProjectStatus } from "@package/database/client";
import { For, Show } from "solid-js";
import { Stack } from "@/components/primitives/stack";
import { createDragAndDrop } from "@/hooks/useDragAndDrop";
import type { KanbanCard, KanbanColumn } from "../types";
import { AddStatusPopover } from "./add-status-popover";
import { KanbanCardItem } from "./kanban-card-item";
import { KanbanColumnHeader } from "./kanban-column-header";

export type { KanbanCard, KanbanColumn };

type KanbanBoardProps = {
	columns: KanbanColumn[];
	readonly?: boolean;
	upvoteDisabled?: boolean;
	availableStatuses?: ProjectStatus[];
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
						class={`w-88 shrink-0 rounded-lg p-3 transition-colors ${
							!props.readonly && dnd.isOver(column.id)
								? "bg-primary/5 dark:bg-primary-dark/10 ring-2 ring-primary/30 dark:ring-primary-dark/30"
								: "bg-surface-alt/50 dark:bg-surface-dark-alt/50"
						}`}
					>
						<KanbanColumnHeader
							columnId={column.id}
							label={column.label}
							cardCount={column.cards.length}
							isFirst={index() === 0}
							isLast={index() === props.columns.length - 1}
							isEmpty={column.cards.length === 0}
							readonly={props.readonly}
							onMoveColumn={props.onMoveColumn}
							onRemoveColumn={props.onRemoveColumn}
						/>
						<Stack spacing="sm">
							<For each={column.cards}>
								{(card) => (
									<KanbanCardItem
										card={card}
										columnId={column.id}
										readonly={props.readonly}
										upvoteDisabled={props.upvoteDisabled}
										isDragging={!props.readonly && dnd.isDragging(card.id)}
										draggableProps={
											props.readonly
												? undefined
												: dnd.draggable(card.id, column.id)
										}
										wasDragged={dnd.wasDragged}
										onCardClick={props.onCardClick}
										onUpvote={props.onUpvote}
										onRemove={props.onRemove}
									/>
								)}
							</For>
						</Stack>
					</div>
				)}
			</For>

			<Show
				when={
					!props.readonly &&
					props.onAddStatus &&
					(props.availableStatuses?.length ?? 0) > 0
				}
			>
				<AddStatusPopover
					availableStatuses={props.availableStatuses ?? []}
					onAddStatus={(status) => props.onAddStatus?.(status)}
				/>
			</Show>
		</div>
	);
};

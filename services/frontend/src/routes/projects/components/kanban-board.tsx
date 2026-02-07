import { For } from "solid-js";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { createDragAndDrop } from "@/hooks/useDragAndDrop";

export type KanbanCard = {
	id: string;
	name: string;
	description?: string;
	tags: string[];
};

export type KanbanColumn = {
	id: string;
	name: string;
	type: "considering" | "using" | "deprecated" | "rejected";
	cards: KanbanCard[];
};

type KanbanBoardProps = {
	columns: KanbanColumn[];
	onCardMove?: (
		cardId: string,
		fromColumnId: string,
		toColumnId: string,
	) => void;
	onCardClick?: (card: KanbanCard, columnId: string) => void;
	onBackgroundClick?: () => void;
};

const columnTypeColors: Record<KanbanColumn["type"], string> = {
	considering: "border-t-blue-400",
	using: "border-t-green-400",
	deprecated: "border-t-amber-400",
	rejected: "border-t-red-400",
};

export const KanbanBoard = (props: KanbanBoardProps) => {
	const dnd = createDragAndDrop({
		onDrop: (itemId, from, to) => props.onCardMove?.(itemId, from, to),
	});

	let cardClicked = false;

	return (
		<div
			ref={(el) => {
				el.addEventListener("click", () => {
					// Runs after card onClick sets cardClicked = true
					setTimeout(() => {
						if (!cardClicked) {
							props.onBackgroundClick?.();
						}
						cardClicked = false;
					}, 0);
				});
			}}
			class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
		>
			<For each={props.columns}>
				{(column) => (
					<div
						{...dnd.droppable(column.id)}
						class={`rounded-lg border-t-4 ${columnTypeColors[column.type]} p-3 transition-colors ${
							dnd.isOver(column.id)
								? "bg-primary/5 dark:bg-primary-dark/10 ring-2 ring-primary/30 dark:ring-primary-dark/30"
								: "bg-surface dark:bg-surface-dark"
						}`}
					>
						<div class="mb-3 flex items-center justify-between">
							<Heading level="h3" class="text-sm">
								{column.name}
							</Heading>
							<Text size="sm" color="muted">
								{column.cards.length}
							</Text>
						</div>
						<Stack spacing="sm">
							<For each={column.cards}>
								{(card) => (
									<button
										type="button"
										{...dnd.draggable(card.id, column.id)}
										onClick={() => {
											if (!dnd.wasDragged()) {
												cardClicked = true;
												props.onCardClick?.(card, column.id);
											}
										}}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												props.onCardClick?.(card, column.id);
											}
										}}
										class={`w-full text-left transition-opacity ${
											dnd.isDragging(card.id) ? "opacity-40" : ""
										}`}
									>
										<Card
											padding="sm"
											class="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
										>
											<Stack spacing="xs">
												<Text weight="semibold" size="sm">
													{card.name}
												</Text>
												{card.description && (
													<Text size="sm" color="muted" class="line-clamp-2">
														{card.description}
													</Text>
												)}
												{card.tags.length > 0 && (
													<div class="flex flex-wrap gap-1">
														<For each={card.tags}>
															{(tag) => (
																<Badge variant="subtle" size="sm">
																	{tag}
																</Badge>
															)}
														</For>
													</div>
												)}
											</Stack>
										</Card>
									</button>
								)}
							</For>
						</Stack>
					</div>
				)}
			</For>
		</div>
	);
};

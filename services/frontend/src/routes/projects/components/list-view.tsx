import type { ProjectStatus } from "@package/database/client";
import { For, Show } from "solid-js";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Collapsible } from "@/components/ui/collapsible";
import { PROJECT_STATUS_DOT_COLORS } from "@/lib/constants";
import type { KanbanCard } from "../types";
import { KanbanCardItem } from "./kanban-card-item";

export type ListGroup = {
	id: string;
	label: string;
	cards: KanbanCard[];
};

type ListViewProps = {
	groups: ListGroup[];
	readonly?: boolean;
	upvoteDisabled?: boolean;
	onCardClick?: (card: KanbanCard, groupId: string) => void;
	onUpvote?: (card: KanbanCard) => void;
	onRemove?: (card: KanbanCard) => void;
};

export const ListView = (props: ListViewProps) => {
	return (
		<div class="space-y-3">
			<For each={props.groups}>
				{(group) => (
					<Collapsible.Root defaultOpen={true}>
						<Collapsible.Trigger size="compact">
							<div class="flex items-center gap-2">
								<Show when={group.id in PROJECT_STATUS_DOT_COLORS}>
									<span
										class={`h-2 w-2 shrink-0 rounded-full ${PROJECT_STATUS_DOT_COLORS[group.id as ProjectStatus] ?? ""}`}
									/>
								</Show>
								<span>{group.label}</span>
								<Badge variant="subtle" size="sm">
									{group.cards.length}
								</Badge>
							</div>
						</Collapsible.Trigger>
						<Collapsible.Content size="compact">
							<Show
								when={group.cards.length > 0}
								fallback={
									<div class="py-3 px-1">
										<Text size="sm" color="muted">
											No items in this group.
										</Text>
									</div>
								}
							>
								<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 pt-2">
									<For each={group.cards}>
										{(card) => (
											<KanbanCardItem
												card={card}
												columnId={group.id}
												readonly={props.readonly}
												upvoteDisabled={props.upvoteDisabled}
												onCardClick={props.onCardClick}
												onUpvote={props.onUpvote}
												onRemove={props.onRemove}
											/>
										)}
									</For>
								</div>
							</Show>
						</Collapsible.Content>
					</Collapsible.Root>
				)}
			</For>

			<Show when={props.groups.length === 0}>
				<Card padding="lg">
					<Text color="muted" class="text-center">
						No items to display.
					</Text>
				</Card>
			</Show>
		</div>
	);
};

import { For, Show } from "solid-js";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Select, type SelectOption } from "@/components/ui/select";
import { SidePanel } from "@/components/ui/side-panel";
import type { KanbanCard, KanbanColumn } from "./kanban-board";

type CardPanelProps = {
	card: KanbanCard;
	currentColumnId: string;
	columns: KanbanColumn[];
	onStatusChange: (
		cardId: string,
		fromColumnId: string,
		toColumnId: string,
	) => void;
	onClose: () => void;
};

export const CardPanel = (props: CardPanelProps) => {
	const statusOptions = (): SelectOption<string>[] =>
		props.columns.map((col) => ({
			value: col.id,
			label: col.name,
		}));

	const handleStatusChange = (newColumnId: string) => {
		if (newColumnId !== props.currentColumnId) {
			props.onStatusChange(props.card.id, props.currentColumnId, newColumnId);
		}
	};

	return (
		<SidePanel open={true} onClose={props.onClose} title={props.card.name}>
			<Stack spacing="lg">
				{/* Status */}
				<div>
					<Text size="sm" weight="semibold" class="mb-2">
						Status
					</Text>
					<Select
						options={statusOptions()}
						value={props.currentColumnId}
						onChange={handleStatusChange}
						aria-label="Card status"
						size="sm"
					/>
				</div>

				{/* Description */}
				<Show when={props.card.description}>
					<div>
						<Text size="sm" weight="semibold" class="mb-2">
							Description
						</Text>
						<Text size="sm" color="muted">
							{props.card.description}
						</Text>
					</div>
				</Show>

				{/* Tags */}
				<Show when={props.card.tags.length > 0}>
					<div>
						<Text size="sm" weight="semibold" class="mb-2">
							Tags
						</Text>
						<div class="flex flex-wrap gap-1">
							<For each={props.card.tags}>
								{(tag) => (
									<Badge variant="subtle" size="sm">
										{tag}
									</Badge>
								)}
							</For>
						</div>
					</div>
				</Show>

				{/* Placeholder for future: notes, comments */}
				<div class="border-t border-outline dark:border-outline-dark pt-4">
					<Text size="sm" color="muted">
						Notes and discussion coming soon.
					</Text>
				</div>
			</Stack>
		</SidePanel>
	);
};

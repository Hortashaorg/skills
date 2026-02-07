import { For, onCleanup, onMount, Show } from "solid-js";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Select, type SelectOption } from "@/components/ui/select";
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

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === "Escape") props.onClose();
	};

	onMount(() => {
		document.addEventListener("keydown", handleKeyDown);
		onCleanup(() => {
			document.removeEventListener("keydown", handleKeyDown);
		});
	});

	return (
		<div
			role="dialog"
			class="fixed top-0 right-0 z-40 h-full w-full max-w-md bg-surface dark:bg-surface-dark border-l border-outline dark:border-outline-dark shadow-xl animate-in slide-in-from-right duration-200 overflow-y-auto"
		>
			<div class="p-6">
				<Stack spacing="lg">
					{/* Header */}
					<div class="flex items-start justify-between gap-4">
						<Heading level="h2">{props.card.name}</Heading>
						<button
							type="button"
							onClick={props.onClose}
							class="shrink-0 rounded-md p-1 text-on-surface-muted dark:text-on-surface-dark-muted hover:bg-surface-alt dark:hover:bg-surface-dark-alt"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<title>Close</title>
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					</div>

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
			</div>
		</div>
	);
};

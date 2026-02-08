import type { ProjectStatus } from "@package/database/client";
import { Show } from "solid-js";
import { Heading } from "@/components/primitives/heading";
import { Text } from "@/components/primitives/text";
import { PROJECT_STATUS_DOT_COLORS } from "@/lib/constants";

type KanbanColumnHeaderProps = {
	columnId: ProjectStatus;
	label: string;
	cardCount: number;
	isFirst: boolean;
	isLast: boolean;
	isEmpty: boolean;
	readonly?: boolean;
	onMoveColumn?: (columnId: string, direction: "left" | "right") => void;
	onRemoveColumn?: (columnId: string) => void;
};

export const KanbanColumnHeader = (props: KanbanColumnHeaderProps) => {
	return (
		<div class="mb-3 flex items-center justify-between gap-1">
			<div class="flex items-center gap-1.5 min-w-0">
				<span
					class={`h-2 w-2 shrink-0 rounded-full ${PROJECT_STATUS_DOT_COLORS[props.columnId]}`}
				/>
				<Show when={!props.readonly && props.onMoveColumn && !props.isFirst}>
					<button
						type="button"
						onClick={() => props.onMoveColumn?.(props.columnId, "left")}
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
					{props.label}
				</Heading>
				<Show when={!props.readonly && props.onMoveColumn && !props.isLast}>
					<button
						type="button"
						onClick={() => props.onMoveColumn?.(props.columnId, "right")}
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
					{props.cardCount}
				</Text>
				<Show when={!props.readonly && props.onRemoveColumn && props.isEmpty}>
					<button
						type="button"
						onClick={() => props.onRemoveColumn?.(props.columnId)}
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
	);
};

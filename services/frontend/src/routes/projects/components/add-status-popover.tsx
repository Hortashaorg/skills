import { Popover } from "@kobalte/core/popover";
import type { ProjectStatus } from "@package/database/client";
import { For } from "solid-js";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type AddStatusPopoverProps = {
	availableStatuses: ProjectStatus[];
	onAddStatus: (status: ProjectStatus) => void;
};

export const AddStatusPopover = (props: AddStatusPopoverProps) => {
	return (
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
									onClick={() => props.onAddStatus(status)}
								>
									{PROJECT_STATUS_LABELS[status]}
								</Popover.CloseButton>
							)}
						</For>
					</Popover.Content>
				</Popover.Portal>
			</Popover>
		</div>
	);
};

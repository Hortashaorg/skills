import { Popover } from "@kobalte/core/popover";
import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import {
	CheckIcon,
	ChevronDownIcon,
	PlusIcon,
} from "@/components/primitives/icon";
import { Text } from "@/components/primitives/text";
import { cn } from "@/lib/utils";

export interface Project {
	id: string;
	name: string;
}

export interface AddToProjectPopoverProps {
	projects: readonly Project[];
	isInProject: (projectId: string) => boolean;
	onAdd: (projectId: string) => void;
	addingToProjectId?: string | null;
}

export const AddToProjectPopover = (props: AddToProjectPopoverProps) => {
	return (
		<Popover>
			<Popover.Trigger
				class={cn(
					"inline-flex items-center gap-1.5 h-8 px-3 rounded-radius border whitespace-nowrap",
					"border-outline-strong dark:border-outline-dark-strong",
					"bg-transparent text-on-surface dark:text-on-surface-dark",
					"text-sm font-medium",
					"hover:opacity-75 transition",
					"focus-visible:outline-2 focus-visible:outline-offset-2",
					"focus-visible:outline-primary dark:focus-visible:outline-primary-dark",
					"cursor-pointer",
				)}
			>
				<PlusIcon size="sm" title="Add to project" />
				<span>Add to project</span>
				<ChevronDownIcon
					size="xs"
					class="text-on-surface-muted dark:text-on-surface-dark-muted"
				/>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					class={cn(
						"z-50 min-w-56 max-h-64 overflow-auto",
						"rounded-radius border border-outline dark:border-outline-dark",
						"bg-surface dark:bg-surface-dark shadow-lg",
						"ui-expanded:animate-in ui-expanded:fade-in-0 ui-expanded:zoom-in-95",
						"ui-closed:animate-out ui-closed:fade-out-0 ui-closed:zoom-out-95",
					)}
				>
					<Show
						when={props.projects.length > 0}
						fallback={
							<div class="p-4 text-center">
								<Text size="sm" color="muted" class="mb-2">
									No projects yet
								</Text>
								<A
									href="/me/projects/new"
									class="text-sm text-primary dark:text-primary-dark hover:underline"
								>
									Create a project
								</A>
							</div>
						}
					>
						<div class="p-1">
							<For each={props.projects}>
								{(project) => {
									const isInProject = () => props.isInProject(project.id);
									const isAdding = () => props.addingToProjectId === project.id;
									return (
										<button
											type="button"
											class={cn(
												"w-full text-left px-3 py-2 text-sm rounded-sm",
												"flex items-center justify-between gap-2",
												"text-on-surface dark:text-on-surface-dark",
												"hover:bg-surface-alt dark:hover:bg-surface-dark-alt",
												"transition-colors cursor-pointer",
												"disabled:opacity-50 disabled:cursor-not-allowed",
											)}
											disabled={isInProject() || isAdding()}
											onClick={() => props.onAdd(project.id)}
										>
											<span class="truncate">{project.name}</span>
											<Show when={isInProject()}>
												<CheckIcon
													size="sm"
													class="text-success shrink-0"
													title="Already in project"
												/>
											</Show>
											<Show when={isAdding()}>
												<span class="text-xs text-on-surface-muted dark:text-on-surface-dark-muted">
													Adding...
												</span>
											</Show>
										</button>
									);
								}}
							</For>
						</div>
						<div class="border-t border-outline dark:border-outline-dark p-2">
							<A
								href="/me/projects/new"
								class="block w-full text-center text-xs text-primary dark:text-primary-dark hover:underline"
							>
								+ Create new project
							</A>
						</div>
					</Show>
				</Popover.Content>
			</Popover.Portal>
		</Popover>
	);
};

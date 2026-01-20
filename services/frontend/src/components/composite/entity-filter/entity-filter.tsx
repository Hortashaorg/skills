import { Popover } from "@kobalte/core/popover";
import { createMemo, For, Show } from "solid-js";
import { CheckIcon, ChevronDownIcon } from "@/components/primitives/icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface FilterOption {
	value: string;
	label: string;
	count: number;
}

export interface EntityFilterProps {
	label?: string;
	options: readonly FilterOption[];
	selectedSlugs: string[];
	onSelectionChange: (slugs: string[]) => void;
}

export const EntityFilter = (props: EntityFilterProps) => {
	const sortedOptions = createMemo(() =>
		[...props.options]
			.filter((t) => t.count > 0)
			.sort((a, b) => b.count - a.count),
	);

	const selectedLabels = createMemo(() => {
		const selected = props.selectedSlugs;
		const options = sortedOptions();
		return options
			.filter((t) => selected.includes(t.value))
			.map((t) => t.label);
	});

	const toggleOption = (slug: string) => {
		const current = props.selectedSlugs;
		if (current.includes(slug)) {
			props.onSelectionChange(current.filter((s) => s !== slug));
		} else {
			props.onSelectionChange([...current, slug]);
		}
	};

	const clearAll = () => {
		props.onSelectionChange([]);
	};

	return (
		<Popover>
			<Popover.Trigger
				class={cn(
					"inline-flex items-center gap-2 h-10 px-3 rounded-md border",
					"border-outline dark:border-outline-dark",
					"bg-surface dark:bg-surface-dark",
					"text-sm text-on-surface dark:text-on-surface-dark",
					"hover:bg-surface-alt dark:hover:bg-surface-dark-alt",
					"focus-visible:outline-none focus-visible:ring-2",
					"focus-visible:ring-primary dark:focus-visible:ring-primary-dark",
					"focus-visible:ring-offset-2 cursor-pointer",
					"whitespace-nowrap",
				)}
			>
				<span class="text-on-surface-subtle dark:text-on-surface-dark-subtle">
					{props.label ?? "Tags"}
				</span>
				<Show when={selectedLabels().length > 0}>
					<Badge size="sm" variant="secondary">
						{selectedLabels().length}
					</Badge>
				</Show>
				<ChevronDownIcon
					size="sm"
					class="text-on-surface-muted dark:text-on-surface-dark-muted"
				/>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					class={cn(
						"z-50 min-w-48 max-h-64 overflow-auto",
						"rounded-md border border-outline dark:border-outline-dark",
						"bg-surface dark:bg-surface-dark shadow-lg p-1",
						"ui-expanded:animate-in ui-expanded:fade-in-0 ui-expanded:zoom-in-95",
						"ui-closed:animate-out ui-closed:fade-out-0 ui-closed:zoom-out-95",
					)}
				>
					<Show
						when={sortedOptions().length > 0}
						fallback={
							<div class="px-3 py-2 text-sm text-on-surface-muted dark:text-on-surface-dark-muted">
								No tags available
							</div>
						}
					>
						<Show when={props.selectedSlugs.length > 0}>
							<button
								type="button"
								onClick={clearAll}
								class={cn(
									"w-full text-left px-3 py-1.5 text-sm rounded-sm",
									"text-danger hover:bg-surface-alt dark:hover:bg-surface-dark-alt",
									"transition-colors cursor-pointer",
								)}
							>
								Clear all
							</button>
							<div class="h-px bg-outline dark:bg-outline-dark my-1" />
						</Show>
						<For each={sortedOptions()}>
							{(option) => {
								const isSelected = () =>
									props.selectedSlugs.includes(option.value);
								return (
									<button
										type="button"
										onClick={() => toggleOption(option.value)}
										class={cn(
											"w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-sm",
											"text-on-surface dark:text-on-surface-dark",
											"hover:bg-surface-alt dark:hover:bg-surface-dark-alt",
											"transition-colors cursor-pointer text-left",
										)}
									>
										<span
											class={cn(
												"w-4 h-4 rounded border flex items-center justify-center",
												"border-outline dark:border-outline-dark",
												isSelected() &&
													"bg-primary dark:bg-primary-dark border-primary dark:border-primary-dark",
											)}
										>
											<Show when={isSelected()}>
												<CheckIcon
													size="xs"
													stroke-width="3"
													class="text-on-primary dark:text-on-primary-dark"
													title="Selected"
												/>
											</Show>
										</span>
										<span class="flex-1">{option.label}</span>
										<span class="text-on-surface-muted dark:text-on-surface-dark-muted">
											{option.count}
										</span>
									</button>
								);
							}}
						</For>
					</Show>
				</Popover.Content>
			</Popover.Portal>
		</Popover>
	);
};

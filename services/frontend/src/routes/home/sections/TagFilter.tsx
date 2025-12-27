import { Popover } from "@kobalte/core/popover";
import { queries, useQuery } from "@package/database/client";
import { createMemo, For, Show } from "solid-js";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface TagFilterProps {
	selectedTagSlugs: string[];
	onTagsChange: (slugs: string[]) => void;
}

export const TagFilter = (props: TagFilterProps) => {
	const [tags] = useQuery(queries.tags.listWithCounts);

	const tagOptions = createMemo(() => {
		return (tags() || [])
			.map((tag) => ({
				value: tag.slug,
				label: tag.name,
				count: tag.packageTags?.length ?? 0,
			}))
			.filter((t) => t.count > 0)
			.sort((a, b) => b.count - a.count);
	});

	const selectedLabels = createMemo(() => {
		const selected = props.selectedTagSlugs;
		const options = tagOptions();
		return options
			.filter((t) => selected.includes(t.value))
			.map((t) => t.label);
	});

	const toggleTag = (slug: string) => {
		const current = props.selectedTagSlugs;
		if (current.includes(slug)) {
			props.onTagsChange(current.filter((s) => s !== slug));
		} else {
			props.onTagsChange([...current, slug]);
		}
	};

	const clearAll = () => {
		props.onTagsChange([]);
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
					Tags
				</span>
				<Show when={selectedLabels().length > 0}>
					<Badge size="sm" variant="secondary">
						{selectedLabels().length}
					</Badge>
				</Show>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="text-on-surface-muted dark:text-on-surface-dark-muted"
				>
					<title>Expand</title>
					<path d="m6 9 6 6 6-6" />
				</svg>
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
						when={tagOptions().length > 0}
						fallback={
							<div class="px-3 py-2 text-sm text-on-surface-muted dark:text-on-surface-dark-muted">
								No tags available
							</div>
						}
					>
						<Show when={props.selectedTagSlugs.length > 0}>
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
						<For each={tagOptions()}>
							{(tag) => {
								const isSelected = () =>
									props.selectedTagSlugs.includes(tag.value);
								return (
									<button
										type="button"
										onClick={() => toggleTag(tag.value)}
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
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="12"
													height="12"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													stroke-width="3"
													stroke-linecap="round"
													stroke-linejoin="round"
													class="text-on-primary dark:text-on-primary-dark"
												>
													<title>Selected</title>
													<polyline points="20 6 9 17 4 12" />
												</svg>
											</Show>
										</span>
										<span class="flex-1">{tag.label}</span>
										<span class="text-on-surface-muted dark:text-on-surface-dark-muted">
											{tag.count}
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

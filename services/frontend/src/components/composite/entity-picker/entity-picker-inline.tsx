import { Combobox } from "@kobalte/core/combobox";
import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import {
	SearchIcon,
	SpinnerIcon,
	XCircleIcon,
} from "@/components/primitives/icon";
import { Badge } from "@/components/ui/badge";
import type { EntityPickerInlineProps, PickerItem } from "./entity-picker";

export const EntityPickerInline = <T extends PickerItem>(
	props: EntityPickerInlineProps<T>,
) => {
	const [isOpen, setIsOpen] = createSignal(false);
	const [listboxRef, setListboxRef] = createSignal<HTMLUListElement | null>(
		null,
	);

	createEffect(() => {
		const listbox = listboxRef();
		if (!listbox) return;

		const observer = new MutationObserver(() => {
			const highlighted = listbox.querySelector("[data-highlighted]");
			if (highlighted) {
				highlighted.scrollIntoView({ block: "nearest" });
			}
		});

		observer.observe(listbox, {
			attributes: true,
			subtree: true,
			attributeFilter: ["data-highlighted"],
		});

		onCleanup(() => observer.disconnect());
	});

	const handleClear = () => {
		props.onSearchChange("");
		setIsOpen(false);
	};

	const getNoResultsMessage = () => {
		return (
			props.noResultsMessage || `No results found for "${props.searchValue}"`
		);
	};

	const defaultRenderItem = (item: T) => (
		<div class="flex items-start justify-between gap-2">
			<div class="flex-1 min-w-0">
				<div class="font-semibold text-on-surface dark:text-on-surface-dark">
					{item.primary}
				</div>
				<Show when={item.secondary}>
					<div class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted line-clamp-2">
						{item.secondary}
					</div>
				</Show>
			</div>
			<Show when={item.label}>
				<div class="shrink-0">
					<Badge variant="subtle" size="sm">
						{item.label}
					</Badge>
				</div>
			</Show>
		</div>
	);

	return (
		<div class={props.class}>
			<Combobox<T>
				onInputChange={(value) => {
					const isFromSelection = props.items.some((r) => r.primary === value);
					if (isFromSelection) return;
					props.onSearchChange(value);
					setIsOpen(value.length > 0);
				}}
				onChange={(item) => {
					if (item) {
						props.onSelect(item);
						props.onSearchChange("");
						setIsOpen(false);
					}
				}}
				open={isOpen()}
				onOpenChange={setIsOpen}
				options={[...props.items]}
				optionValue="id"
				optionTextValue="primary"
				optionLabel="primary"
				placeholder={props.placeholder || "Search..."}
				allowsEmptyCollection={true}
				shouldFocusWrap={true}
				itemComponent={(itemProps) => (
					<Combobox.Item
						item={itemProps.item}
						class="w-full text-left px-4 py-3 hover:bg-surface-alt dark:hover:bg-surface-dark-alt ui-highlighted:bg-surface-alt dark:ui-highlighted:bg-surface-dark-alt transition-colors border-b border-outline/50 dark:border-outline-dark/50 last:border-b-0 cursor-pointer outline-none scroll-my-2"
					>
						{props.renderItem
							? props.renderItem(itemProps.item.rawValue)
							: defaultRenderItem(itemProps.item.rawValue)}
					</Combobox.Item>
				)}
			>
				<div class="flex flex-col gap-1">
					<Show when={props.label}>
						<Combobox.Label class="text-sm font-medium leading-none text-on-surface-strong dark:text-on-surface-dark-strong peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							{props.label}
						</Combobox.Label>
					</Show>

					<Combobox.Control class="relative">
						<div class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-subtle dark:text-on-surface-dark-subtle z-10 pointer-events-none">
							<SearchIcon size="sm" />
						</div>

						<Combobox.Input
							value={props.searchValue}
							class="flex h-10 w-full rounded-radius border border-outline dark:border-outline-dark bg-transparent px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark placeholder:text-on-surface-subtle dark:placeholder:text-on-surface-dark-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9 pr-16"
						/>

						<div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
							<Show when={props.isLoading}>
								<div class="text-on-surface-subtle dark:text-on-surface-dark-subtle">
									<SpinnerIcon size="sm" />
								</div>
							</Show>

							<Show when={props.searchValue}>
								<button
									type="button"
									onClick={handleClear}
									class="text-on-surface-subtle dark:text-on-surface-dark-subtle hover:text-on-surface dark:hover:text-on-surface-dark transition-colors"
									aria-label="Clear search"
								>
									<XCircleIcon size="sm" />
								</button>
							</Show>
						</div>
					</Combobox.Control>
				</div>

				<Combobox.Portal>
					<Combobox.Content class="z-50 mt-1 max-w-(--kb-popper-anchor-width) bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-radius shadow-lg max-h-60 overflow-auto ui-expanded:animate-in ui-expanded:fade-in-0 ui-expanded:zoom-in-95 ui-closed:animate-out ui-closed:fade-out-0 ui-closed:zoom-out-95">
						<Combobox.Listbox ref={setListboxRef} class="flex flex-col" />
						<Show
							when={
								props.searchValue &&
								props.items.length === 0 &&
								!props.isLoading
							}
						>
							<div class="p-4 text-center">
								<div class="text-on-surface-muted dark:text-on-surface-dark-muted">
									{getNoResultsMessage()}
								</div>
							</div>
						</Show>
					</Combobox.Content>
				</Combobox.Portal>
			</Combobox>
		</div>
	);
};

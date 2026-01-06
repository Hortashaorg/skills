import { Combobox } from "@kobalte/core/combobox";
import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import {
	SearchIcon,
	SpinnerIcon,
	XCircleIcon,
} from "@/components/primitives/icon";

/**
 * Generic search result item structure
 */
export interface SearchResultItem {
	/** Unique identifier */
	id: string;
	/** Primary text (e.g., name, title) */
	primary: string;
	/** Optional secondary text (e.g., description) */
	secondary?: string;
	/** Optional label for badge (e.g., category, type) */
	label?: string;
	/** If true, selecting this item triggers an action (e.g., navigation) without updating input */
	isAction?: boolean;
}

export interface SearchInputProps {
	/** Controlled search value */
	value: string;
	/** Called when user types */
	onValueChange: (value: string) => void;
	/** Results to display in dropdown */
	results: SearchResultItem[];
	/** Show loading spinner */
	isLoading?: boolean;
	/** Called when user selects an item */
	onSelect?: (item: SearchResultItem) => void;
	/** Called when user clears search */
	onClear?: () => void;
	/** Placeholder text for input */
	placeholder?: string;
	/** Label above input */
	label?: string;
	/** Custom CSS class */
	class?: string;
	/** Custom message when no results found */
	noResultsMessage?: string;
}

export const SearchInput = (props: SearchInputProps) => {
	const [isOpen, setIsOpen] = createSignal(false);
	const [selectedItem, setSelectedItem] = createSignal<SearchResultItem>();
	const [listboxRef, setListboxRef] = createSignal<HTMLUListElement | null>(
		null,
	);

	// Auto-scroll highlighted item into view during keyboard navigation
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
		props.onValueChange("");
		setSelectedItem(undefined);
		setIsOpen(false);
		props.onClear?.();
	};

	const getNoResultsMessage = () => {
		return props.noResultsMessage || `No results found for "${props.value}"`;
	};

	return (
		<div class={props.class}>
			<Combobox<SearchResultItem>
				value={selectedItem()}
				onInputChange={(value) => {
					// Ignore if value matches an item's primary (means it's from selection, not typing)
					const isFromSelection = props.results.some(
						(r) => r.primary === value,
					);
					if (isFromSelection) return;

					props.onValueChange(value);
					setSelectedItem(undefined);
					setIsOpen(value.length > 0);
				}}
				onChange={(item) => {
					if (item) {
						props.onSelect?.(item);
						if (!item.isAction) {
							setSelectedItem(item);
							props.onValueChange(item.primary);
						}
						setIsOpen(false);
					}
				}}
				open={isOpen()}
				onOpenChange={setIsOpen}
				options={props.results}
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
						<div class="flex items-start justify-between gap-2">
							<div class="flex-1 min-w-0">
								<div class="font-semibold text-on-surface dark:text-on-surface-dark">
									{itemProps.item.rawValue.primary}
								</div>
								<Show when={itemProps.item.rawValue.secondary}>
									<div class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted line-clamp-2">
										{itemProps.item.rawValue.secondary}
									</div>
								</Show>
							</div>
							<Show when={itemProps.item.rawValue.label}>
								<div class="shrink-0">
									<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 dark:bg-primary-dark/10 text-primary dark:text-primary-dark">
										{itemProps.item.rawValue.label}
									</span>
								</div>
							</Show>
						</div>
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
							value={props.value}
							class="flex h-10 w-full rounded-md border border-outline dark:border-outline-dark bg-transparent px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark placeholder:text-on-surface-subtle dark:placeholder:text-on-surface-dark-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ui-invalid:border-danger ui-invalid:text-danger ui-invalid:dark:text-danger-dark pl-9 pr-20"
						/>

						<div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
							<Show when={props.isLoading}>
								<div class="text-on-surface-subtle dark:text-on-surface-dark-subtle">
									<SpinnerIcon size="sm" />
								</div>
							</Show>

							<Show when={props.value}>
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
					<Combobox.Content class="z-50 mt-1 max-w-(--kb-popper-anchor-width) bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-md shadow-lg max-h-60 overflow-auto ui-expanded:animate-in ui-expanded:fade-in-0 ui-expanded:zoom-in-95 ui-closed:animate-out ui-closed:fade-out-0 ui-closed:zoom-out-95">
						<Combobox.Listbox ref={setListboxRef} class="flex flex-col" />
						<Show
							when={
								props.value && props.results.length === 0 && !props.isLoading
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

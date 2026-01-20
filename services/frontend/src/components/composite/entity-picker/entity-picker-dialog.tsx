import { Combobox } from "@kobalte/core/combobox";
import { Dialog as DialogPrimitive } from "@kobalte/core/dialog";
import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import {
	PlusIcon,
	SearchIcon,
	SpinnerIcon,
	XCircleIcon,
} from "@/components/primitives/icon";
import { cn } from "@/lib/utils";
import type { EntityPickerDialogProps, PickerItem } from "./entity-picker";

const overlayStyles = [
	"fixed",
	"inset-0",
	"z-50",
	"bg-black/50",
	"ui-expanded:animate-in",
	"ui-expanded:fade-in-0",
	"ui-closed:animate-out",
	"ui-closed:fade-out-0",
];

const contentStyles = [
	"fixed",
	"left-1/2",
	"top-1/2",
	"z-50",
	"w-full",
	"max-w-md",
	"-translate-x-1/2",
	"-translate-y-1/2",
	"rounded-radius",
	"border",
	"border-outline",
	"bg-surface",
	"p-6",
	"shadow-lg",
	"dark:border-outline-dark",
	"dark:bg-surface-dark",
	"ui-expanded:animate-in",
	"ui-expanded:fade-in-0",
	"ui-expanded:zoom-in-95",
	"ui-closed:animate-out",
	"ui-closed:fade-out-0",
	"ui-closed:zoom-out-95",
];

export const EntityPickerDialog = <T extends PickerItem>(
	props: EntityPickerDialogProps<T>,
) => {
	const [internalOpen, setInternalOpen] = createSignal(false);
	const [listboxRef, setListboxRef] = createSignal<HTMLUListElement | null>(
		null,
	);

	const isOpen = () => props.open ?? internalOpen();
	const setIsOpen = (open: boolean) => {
		setInternalOpen(open);
		props.onOpenChange?.(open);
	};

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
					<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 dark:bg-primary-dark/10 text-primary dark:text-primary-dark">
						{item.label}
					</span>
				</div>
			</Show>
		</div>
	);

	const TriggerIcon = props.triggerIcon ?? PlusIcon;

	return (
		<DialogPrimitive open={isOpen()} onOpenChange={setIsOpen}>
			<DialogPrimitive.Trigger
				class={cn(
					"inline-flex items-center gap-2 h-10 px-4 rounded-radius",
					"bg-primary dark:bg-primary-dark",
					"text-on-primary dark:text-on-primary-dark",
					"text-sm font-medium",
					"hover:opacity-90 transition-opacity",
					"focus-visible:outline-none focus-visible:ring-2",
					"focus-visible:ring-primary dark:focus-visible:ring-primary-dark",
					"focus-visible:ring-offset-2",
					"cursor-pointer",
					props.class,
				)}
			>
				<TriggerIcon size="sm" />
				{props.triggerLabel}
			</DialogPrimitive.Trigger>

			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay class={cn(overlayStyles)} />
				<DialogPrimitive.Content class={cn(contentStyles)}>
					<DialogPrimitive.Title class="text-lg font-semibold text-on-surface-strong dark:text-on-surface-dark-strong">
						{props.dialogTitle}
					</DialogPrimitive.Title>
					<Show when={props.dialogDescription}>
						<DialogPrimitive.Description class="mt-2 text-sm text-on-surface dark:text-on-surface-dark">
							{props.dialogDescription}
						</DialogPrimitive.Description>
					</Show>

					<div class="mt-4">
						<Combobox<T>
							onInputChange={(value) => {
								const isFromSelection = props.items.some(
									(r) => r.primary === value,
								);
								if (isFromSelection) return;
								props.onSearchChange(value);
							}}
							onChange={(item) => {
								if (item) {
									props.onSelect(item);
									props.onSearchChange("");
									setIsOpen(false);
								}
							}}
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
							<Combobox.Control class="relative">
								<div class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-subtle dark:text-on-surface-dark-subtle z-10 pointer-events-none">
									<SearchIcon size="sm" />
								</div>

								<Combobox.Input
									value={props.searchValue}
									class="flex h-10 w-full rounded-radius border border-outline dark:border-outline-dark bg-transparent px-3 py-2 text-sm text-on-surface dark:text-on-surface-dark placeholder:text-on-surface-subtle dark:placeholder:text-on-surface-dark-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9 pr-10"
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

							<Combobox.Content class="mt-2 bg-surface dark:bg-surface-dark border border-outline dark:border-outline-dark rounded-radius shadow-lg max-h-60 overflow-auto">
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
								<Show when={!props.searchValue && props.items.length === 0}>
									<div class="p-4 text-center">
										<div class="text-on-surface-muted dark:text-on-surface-dark-muted">
											Type to search...
										</div>
									</div>
								</Show>
							</Combobox.Content>
						</Combobox>
					</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive>
	);
};

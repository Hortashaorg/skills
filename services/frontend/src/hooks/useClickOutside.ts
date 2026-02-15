import { type Accessor, onCleanup, onMount } from "solid-js";

type ClickOutsideOptions = {
	/** Refs to elements that are considered "inside" — clicks on these won't trigger onClickOutside */
	refs: Accessor<(HTMLElement | undefined)[]>;
	/** Called when a click lands outside all refs */
	onClickOutside: () => void;
	/** Reactive flag to enable/disable the listener */
	enabled: Accessor<boolean>;
};

/**
 * Calls onClickOutside when a click occurs outside all provided element refs.
 * Uses native event listeners to avoid SolidJS event delegation issues.
 *
 * @example
 * ```tsx
 * let panelRef: HTMLElement | undefined;
 * let boardRef: HTMLElement | undefined;
 *
 * createClickOutside({
 *   refs: () => [panelRef, boardRef],
 *   onClickOutside: () => setOpen(false),
 *   enabled: () => isOpen(),
 * });
 * ```
 */
export function createClickOutside(options: ClickOutsideOptions) {
	const handleClick = (e: MouseEvent) => {
		if (!options.enabled()) return;

		const target = e.target as Node;
		const elements = options.refs();

		const isInside = elements.some((el) => el?.contains(target));

		if (!isInside) {
			options.onClickOutside();
		}
	};

	onMount(() => {
		// Use capture phase so we see the click before any stopPropagation
		document.addEventListener("click", handleClick, true);
		onCleanup(() => {
			document.removeEventListener("click", handleClick, true);
		});
	});
}

import type { Accessor, Setter } from "solid-js";
import { createEffect, createSignal, onCleanup } from "solid-js";
import {
	BACK_TO_TOP_SCROLL_THRESHOLD,
	INFINITE_SCROLL_DEBOUNCE_MS,
	INFINITE_SCROLL_ROOT_MARGIN,
	SEARCH_AUTO_LOAD_LIMIT,
	SEARCH_INITIAL_LIMIT,
	SEARCH_LOAD_MORE_COUNT,
} from "@/lib/constants";

export interface UseInfiniteScrollOptions {
	/** Initial limit for items to load. Default: 20 */
	initialLimit?: number;
	/** How many items to add on each load more. Default: 20 */
	loadMoreCount?: number;
	/** Auto-load stops after this many items, requiring manual "Load more". Default: 200 */
	autoLoadLimit?: number;
}

export interface UseInfiniteScrollReturn {
	/** Current limit signal */
	limit: Accessor<number>;
	/** Limit setter - typically use loadMore() instead */
	setLimit: Setter<number>;

	/** Ref for the sentinel element that triggers infinite scroll */
	sentinelRef: Accessor<HTMLDivElement | null>;
	/** Set the sentinel ref (use as ref={setSentinelRef} on a div) */
	setSentinelRef: Setter<HTMLDivElement | null>;

	/** Whether to show the "back to top" button */
	showBackToTop: Accessor<boolean>;
	/** Smooth scroll to top of page */
	scrollToTop: () => void;

	/** Whether we've passed the auto-load limit */
	pastAutoLoadLimit: Accessor<boolean>;

	/** Increment limit by loadMoreCount */
	loadMore: () => void;

	/** Reset limit to initial value (call when filters change) */
	resetLimit: () => void;

	/** Check if we can load more (items.length >= limit) */
	canLoadMore: (itemCount: number) => boolean;
}

/**
 * Reusable hook for infinite scroll behavior.
 *
 * Handles:
 * - Limit management with load more
 * - IntersectionObserver for auto-loading
 * - Debounced load-more to prevent rapid-fire calls
 * - Back to top button visibility
 * - Auto-load limit (manual button after threshold)
 *
 * @example
 * ```tsx
 * const scroll = useInfiniteScroll();
 *
 * const [items] = useQuery(() => queries.items.list({ limit: scroll.limit() }));
 *
 * // Reset limit when filters change
 * createEffect(on([searchValue], () => scroll.resetLimit()));
 *
 * <div class="grid ...">
 *   <For each={items()}>{item => <Card ... />}</For>
 * </div>
 *
 * // Sentinel element triggers loading when visible
 * <div ref={scroll.setSentinelRef} class="h-1" />
 *
 * // Manual load more after auto-load limit
 * <Show when={scroll.canLoadMore(items().length) && scroll.pastAutoLoadLimit()}>
 *   <Button onClick={scroll.loadMore}>Load more</Button>
 * </Show>
 *
 * // Back to top button
 * <Show when={scroll.showBackToTop()}>
 *   <Button onClick={scroll.scrollToTop}>↑ Back to top</Button>
 * </Show>
 * ```
 */
export function useInfiniteScroll(
	options: UseInfiniteScrollOptions = {},
): UseInfiniteScrollReturn {
	const {
		initialLimit = SEARCH_INITIAL_LIMIT,
		loadMoreCount = SEARCH_LOAD_MORE_COUNT,
		autoLoadLimit = SEARCH_AUTO_LOAD_LIMIT,
	} = options;

	const [limit, setLimit] = createSignal(initialLimit);
	const [sentinelRef, setSentinelRef] = createSignal<HTMLDivElement | null>(
		null,
	);
	const [showBackToTop, setShowBackToTop] = createSignal(false);

	const pastAutoLoadLimit = () => limit() >= autoLoadLimit;

	const loadMore = () => {
		setLimit((prev) => prev + loadMoreCount);
	};

	const resetLimit = () => {
		setLimit(initialLimit);
	};

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const canLoadMore = (itemCount: number) => itemCount >= limit();

	// Debounced load more to prevent rapid-fire calls
	let loadMoreTimeout: ReturnType<typeof setTimeout> | undefined;
	const loadMoreDebounced = () => {
		if (loadMoreTimeout) return;
		loadMoreTimeout = setTimeout(() => {
			loadMoreTimeout = undefined;
			if (!pastAutoLoadLimit()) {
				loadMore();
			}
		}, INFINITE_SCROLL_DEBOUNCE_MS);
	};

	// IntersectionObserver for auto-loading (before auto-load limit)
	createEffect(() => {
		const sentinel = sentinelRef();
		if (!sentinel) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					loadMoreDebounced();
				}
			},
			{ rootMargin: INFINITE_SCROLL_ROOT_MARGIN },
		);

		observer.observe(sentinel);

		onCleanup(() => {
			observer.disconnect();
			if (loadMoreTimeout) {
				clearTimeout(loadMoreTimeout);
				loadMoreTimeout = undefined;
			}
		});
	});

	// Show back to top button after scrolling down
	createEffect(() => {
		const handleScroll = () => {
			setShowBackToTop(window.scrollY > BACK_TO_TOP_SCROLL_THRESHOLD);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		onCleanup(() => window.removeEventListener("scroll", handleScroll));
	});

	return {
		limit,
		setLimit,
		sentinelRef,
		setSentinelRef,
		showBackToTop,
		scrollToTop,
		pastAutoLoadLimit,
		loadMore,
		resetLimit,
		canLoadMore,
	};
}

/**
 * Stabilizes an array to prevent flicker during load-more operations.
 *
 * During load-more (not filter changes):
 * - Keeps existing items in their current order
 * - Updates existing items with new data (e.g., upvote counts)
 * - Appends new items at the end
 * - Rejects shorter arrays (prevents flicker from incomplete syncs)
 *
 * During filter changes:
 * - Returns the new array directly
 *
 * @example
 * ```tsx
 * const [stableItems, setStableItems] = createSignal<Item[]>([]);
 * const [lastFilterKey, setLastFilterKey] = createSignal("");
 *
 * createEffect(() => {
 *   if (!queryComplete()) return;
 *
 *   const filterKey = `${search()}|${tags().join(",")}`;
 *   const filtersChanged = filterKey !== lastFilterKey();
 *
 *   const stabilized = stabilizeArray(
 *     items(),
 *     stableItems(),
 *     filtersChanged,
 *     (item) => item.id
 *   );
 *
 *   if (stabilized) {
 *     setStableItems(stabilized);
 *     setLastFilterKey(filterKey);
 *   }
 * });
 * ```
 */
export function stabilizeArray<T>(
	newItems: readonly T[],
	oldItems: readonly T[],
	filtersChanged: boolean,
	getId: (item: T) => string,
): T[] | null {
	// Filter change = fresh start
	if (filtersChanged || oldItems.length === 0) {
		return [...newItems];
	}

	// During load-more, reject shorter arrays (prevents flicker)
	if (newItems.length < oldItems.length) {
		return null;
	}

	const oldIds = new Set(oldItems.map(getId));
	const newById = new Map(newItems.map((item) => [getId(item), item]));

	const result: T[] = [];

	// Keep existing items in order, with updated data
	for (const old of oldItems) {
		const updated = newById.get(getId(old));
		if (updated) {
			result.push(updated);
		}
	}

	// Append new items
	for (const item of newItems) {
		if (!oldIds.has(getId(item))) {
			result.push(item);
		}
	}

	return result;
}

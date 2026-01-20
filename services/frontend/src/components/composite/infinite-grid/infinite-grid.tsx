import { Index, type JSX, Show, splitProps } from "solid-js";
import { Stack } from "@/components/primitives/stack";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DefaultSkeleton = () => (
	<Card padding="md" class="h-full">
		<div class="flex flex-col h-full gap-2">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Skeleton width="120px" height="20px" />
					<Skeleton width="40px" height="20px" />
				</div>
				<Skeleton width="50px" height="28px" variant="rectangular" />
			</div>
			<Skeleton width="100%" height="16px" />
			<Skeleton width="75%" height="16px" />
		</div>
	</Card>
);

export interface InfiniteGridProps {
	/** Number of items currently loaded */
	itemCount: number;

	/** Whether the initial query is still loading */
	isLoading: boolean;

	/** Whether more items can be loaded (itemCount >= limit) */
	canLoadMore: boolean;

	/** Callback to load more items */
	onLoadMore: () => void;

	/** Whether we've passed the auto-load limit (show manual button) */
	pastAutoLoadLimit: boolean;

	/** Whether to show the back to top button */
	showBackToTop: boolean;

	/** Callback to scroll to top */
	onScrollToTop: () => void;

	/** Ref setter for the sentinel element (IntersectionObserver target) */
	setSentinelRef: (el: HTMLDivElement | null) => void;

	/** Grid content (use <For> to render items) */
	children: JSX.Element;

	/** Optional special cards to show before items (exact matches, add card) */
	specialCards?: JSX.Element;

	/** Empty state when no items and not loading */
	emptyState?: JSX.Element;

	/** Number of skeleton cards to show during initial load. Default: 6 */
	skeletonCount?: number;

	/** Custom skeleton card component */
	skeletonCard?: () => JSX.Element;

	/** Text for the load more button. Default: "Load more" */
	loadMoreText?: string;

	/** Additional class names for the grid container */
	class?: string;
}

/**
 * A reusable grid component for infinite scroll lists.
 *
 * Provides:
 * - Responsive grid layout (1 → 2 → 3 columns)
 * - Skeleton loading states
 * - Load more button (after auto-load limit)
 * - Back to top button
 * - Sentinel element for auto-loading
 *
 * Use with the `useInfiniteScroll` hook for state management.
 *
 * @example
 * ```tsx
 * const scroll = useInfiniteScroll();
 * const [items] = useQuery(() => queries.items.list({ limit: scroll.limit() }));
 *
 * <InfiniteGrid
 *   itemCount={items()?.length ?? 0}
 *   isLoading={queryResult().type !== "complete"}
 *   canLoadMore={scroll.canLoadMore(items()?.length ?? 0)}
 *   onLoadMore={scroll.loadMore}
 *   pastAutoLoadLimit={scroll.pastAutoLoadLimit()}
 *   showBackToTop={scroll.showBackToTop()}
 *   onScrollToTop={scroll.scrollToTop}
 *   setSentinelRef={scroll.setSentinelRef}
 *   emptyState={<EmptyState title="No items found" />}
 * >
 *   <For each={items()}>
 *     {(item) => <ItemCard item={item} />}
 *   </For>
 * </InfiniteGrid>
 * ```
 */
export const InfiniteGrid = (props: InfiniteGridProps) => {
	const [local, others] = splitProps(props, [
		"itemCount",
		"isLoading",
		"canLoadMore",
		"onLoadMore",
		"pastAutoLoadLimit",
		"showBackToTop",
		"onScrollToTop",
		"setSentinelRef",
		"children",
		"specialCards",
		"emptyState",
		"skeletonCount",
		"skeletonCard",
		"loadMoreText",
		"class",
	]);

	const skeletonCount = () => local.skeletonCount ?? 6;
	const loadMoreText = () => local.loadMoreText ?? "Load more";
	const SkeletonCard = () =>
		local.skeletonCard ? local.skeletonCard() : <DefaultSkeleton />;

	const showLoadMoreButton = () => local.canLoadMore && local.pastAutoLoadLimit;
	const showAutoLoadSkeletons = () =>
		local.canLoadMore && !local.pastAutoLoadLimit;

	const showEmpty = () =>
		!local.isLoading && local.itemCount === 0 && !local.specialCards;
	const showResults = () => local.itemCount > 0 || local.specialCards;

	return (
		<Stack spacing="md" {...others}>
			{/* Empty state */}
			<Show when={showEmpty()}>{local.emptyState}</Show>

			{/* Initial loading skeleton */}
			<Show when={local.isLoading && !showResults()}>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					<Index each={Array(skeletonCount())}>{() => <SkeletonCard />}</Index>
				</div>
			</Show>

			{/* Results grid */}
			<Show when={showResults()}>
				<div
					class={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${local.class ?? ""}`}
				>
					{/* Special cards first (exact matches, suggest card, etc.) */}
					{local.specialCards}

					{/* Grid items */}
					{local.children}

					{/* Auto-load skeletons */}
					<Show when={showAutoLoadSkeletons()}>
						<Index each={Array(3)}>{() => <SkeletonCard />}</Index>
					</Show>
				</div>

				{/* Manual load more button (after auto-load limit) */}
				<Show when={showLoadMoreButton()}>
					<div class="flex justify-center pt-4">
						<Button variant="outline" onClick={local.onLoadMore}>
							{loadMoreText()}
						</Button>
					</div>
				</Show>

				{/* Sentinel element for IntersectionObserver */}
				<div ref={local.setSentinelRef} class="h-1" />

				{/* Back to top button */}
				<Show when={local.showBackToTop}>
					<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
						<Button variant="info" size="md" onClick={local.onScrollToTop}>
							↑ Back to top
						</Button>
					</div>
				</Show>
			</Show>
		</Stack>
	);
};

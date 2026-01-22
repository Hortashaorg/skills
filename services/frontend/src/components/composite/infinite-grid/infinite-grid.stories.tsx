import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Text } from "@/components/primitives/text";
import { createThemedStories } from "@/components/story-helpers";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { InfiniteGrid } from "./infinite-grid";

const meta = {
	title: "Composite/InfiniteGrid",
	component: InfiniteGrid,
	tags: ["autodocs"],
	argTypes: {
		itemCount: {
			control: "number",
			description: "Number of items currently loaded",
		},
		isLoading: {
			control: "boolean",
			description: "Whether the initial query is loading",
		},
		canLoadMore: {
			control: "boolean",
			description: "Whether more items can be loaded",
		},
		pastAutoLoadLimit: {
			control: "boolean",
			description: "Whether past auto-load limit (show manual button)",
		},
		showBackToTop: {
			control: "boolean",
			description: "Whether to show back to top button",
		},
		skeletonCount: {
			control: "number",
			description: "Number of skeleton cards during initial load",
		},
		loadMoreText: {
			control: "text",
			description: "Text for the load more button",
		},
	},
} satisfies Meta<typeof InfiniteGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const MockCard = (props: { index: number }) => (
	<Card padding="md">
		<Text weight="medium">Item {props.index}</Text>
		<Text size="sm" color="muted">
			This is a sample card for testing the grid layout
		</Text>
	</Card>
);

// Loading state
const loadingBase: Story = {
	args: {
		itemCount: 0,
		isLoading: true,
		canLoadMore: false,
		onLoadMore: () => {},
		pastAutoLoadLimit: false,
		showBackToTop: false,
		onScrollToTop: () => {},
		setSentinelRef: () => {},
		children: null,
		skeletonCount: 6,
	},
};

const loadingThemed = createThemedStories({
	story: loadingBase,
	testMode: "both",
});

export const LoadingLight = loadingThemed.Light;
export const LoadingDark = loadingThemed.Dark;

// Empty state
const emptyBase: Story = {
	args: {
		itemCount: 0,
		isLoading: false,
		canLoadMore: false,
		onLoadMore: () => {},
		pastAutoLoadLimit: false,
		showBackToTop: false,
		onScrollToTop: () => {},
		setSentinelRef: () => {},
		children: null,
		emptyState: (
			<EmptyState
				title="No items found"
				description="Try adjusting your search or filters"
			/>
		),
	},
};

const emptyThemed = createThemedStories({
	story: emptyBase,
	testMode: "both",
});

export const EmptyLight = emptyThemed.Light;
export const EmptyDark = emptyThemed.Dark;

// With items (can load more, before auto-limit)
const withItemsBase: Story = {
	render: () => {
		const items = Array.from({ length: 6 }, (_, i) => i + 1);
		return (
			<InfiniteGrid
				itemCount={items.length}
				isLoading={false}
				canLoadMore={true}
				onLoadMore={() => {}}
				pastAutoLoadLimit={false}
				showBackToTop={false}
				onScrollToTop={() => {}}
				setSentinelRef={() => {}}
			>
				{items.map((i) => (
					<MockCard index={i} />
				))}
			</InfiniteGrid>
		);
	},
};

const withItemsThemed = createThemedStories({
	story: withItemsBase,
	testMode: "both",
});

export const WithItemsLight = withItemsThemed.Light;
export const WithItemsDark = withItemsThemed.Dark;

// With load more button (past auto-limit)
const withLoadMoreBase: Story = {
	render: () => {
		const items = Array.from({ length: 9 }, (_, i) => i + 1);
		return (
			<InfiniteGrid
				itemCount={items.length}
				isLoading={false}
				canLoadMore={true}
				onLoadMore={() => alert("Load more clicked!")}
				pastAutoLoadLimit={true}
				showBackToTop={false}
				onScrollToTop={() => {}}
				setSentinelRef={() => {}}
				loadMoreText="Load more items"
			>
				{items.map((i) => (
					<MockCard index={i} />
				))}
			</InfiniteGrid>
		);
	},
};

const withLoadMoreThemed = createThemedStories({
	story: withLoadMoreBase,
	testMode: "light",
});

export const WithLoadMoreLight = withLoadMoreThemed.Light;
export const WithLoadMoreDark = withLoadMoreThemed.Dark;

// With special cards
const withSpecialCardsBase: Story = {
	render: () => {
		const items = Array.from({ length: 4 }, (_, i) => i + 1);
		return (
			<InfiniteGrid
				itemCount={items.length}
				isLoading={false}
				canLoadMore={false}
				onLoadMore={() => {}}
				pastAutoLoadLimit={false}
				showBackToTop={false}
				onScrollToTop={() => {}}
				setSentinelRef={() => {}}
				specialCards={
					<>
						<Card padding="md" class="border-dashed border-2">
							<Text weight="medium">Suggest New Item</Text>
							<Text size="sm" color="muted">
								Click to add a new item
							</Text>
						</Card>
						<Card padding="md" class="bg-info/10">
							<Text weight="medium">Exact Match</Text>
							<Text size="sm" color="muted">
								This matches your search exactly
							</Text>
						</Card>
					</>
				}
			>
				{items.map((i) => (
					<MockCard index={i} />
				))}
			</InfiniteGrid>
		);
	},
};

const withSpecialCardsThemed = createThemedStories({
	story: withSpecialCardsBase,
	testMode: "light",
});

export const WithSpecialCardsLight = withSpecialCardsThemed.Light;
export const WithSpecialCardsDark = withSpecialCardsThemed.Dark;

// Interactive demo with state
const interactiveBase: Story = {
	render: () => {
		const [itemCount, setItemCount] = createSignal(6);
		const [isLoading, setIsLoading] = createSignal(false);

		const loadMore = () => {
			setIsLoading(true);
			setTimeout(() => {
				setItemCount((c) => c + 3);
				setIsLoading(false);
			}, 500);
		};

		const items = () => Array.from({ length: itemCount() }, (_, i) => i + 1);

		return (
			<InfiniteGrid
				itemCount={itemCount()}
				isLoading={isLoading()}
				canLoadMore={itemCount() < 15}
				onLoadMore={loadMore}
				pastAutoLoadLimit={itemCount() >= 9}
				showBackToTop={false}
				onScrollToTop={() => window.scrollTo({ top: 0, behavior: "smooth" })}
				setSentinelRef={() => {}}
			>
				{items().map((i) => (
					<MockCard index={i} />
				))}
			</InfiniteGrid>
		);
	},
};

const interactiveThemed = createThemedStories({
	story: interactiveBase,
	testMode: "none",
});

export const InteractiveLight = interactiveThemed.Light;
export const InteractiveDark = interactiveThemed.Dark;

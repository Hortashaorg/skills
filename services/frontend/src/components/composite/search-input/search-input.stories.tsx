import { expect, userEvent, within } from "@storybook/test";
import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { SearchInput, type SearchResultItem } from "./search-input";

// Mock search data for stories
const mockResults: SearchResultItem[] = [
	{
		id: "1",
		primary: "React",
		secondary: "A JavaScript library for building user interfaces",
		label: "npm",
	},
	{
		id: "2",
		primary: "Vue",
		secondary: "The Progressive JavaScript Framework",
		label: "npm",
	},
	{
		id: "3",
		primary: "Svelte",
		secondary: "Cybernetically enhanced web apps",
		label: "jsr",
	},
	{
		id: "4",
		primary: "Angular",
		secondary: "Platform for building mobile and desktop web applications",
		label: "npm",
	},
	{
		id: "5",
		primary: "SolidJS",
		secondary: "Simple and performant reactivity for building user interfaces",
		label: "npm",
	},
];

const meta = {
	title: "Composite/SearchInput",
	component: SearchInput,
	tags: ["autodocs"],
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultBase: Story = {
	render: () => {
		const [searchValue, setSearchValue] = createSignal("");

		// Filter results based on search value
		const filteredResults = () => {
			const term = searchValue().toLowerCase().trim();
			if (!term) return [];
			return mockResults.filter((item) =>
				item.primary.toLowerCase().includes(term),
			);
		};

		return (
			<div class="h-96">
				<SearchInput
					value={searchValue()}
					onValueChange={setSearchValue}
					results={filteredResults()}
					placeholder="Search frameworks..."
				/>
				<div class="mt-4 text-sm text-on-surface-muted dark:text-on-surface-dark-muted">
					Type "react", "vue", "svelte", "angular", or "solid" to see results
				</div>
			</div>
		);
	},
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "both",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

const withLabelBase: Story = {
	render: () => {
		const [searchValue, setSearchValue] = createSignal("");

		const filteredResults = () => {
			const term = searchValue().toLowerCase().trim();
			if (!term) return [];
			return mockResults.filter((item) =>
				item.primary.toLowerCase().includes(term),
			);
		};

		return (
			<div class="h-96">
				<SearchInput
					value={searchValue()}
					onValueChange={setSearchValue}
					results={filteredResults()}
					label="Search Frameworks"
					placeholder="Type to search..."
				/>
			</div>
		);
	},
};

const withLabelThemed = createThemedStories({
	story: withLabelBase,
	testMode: "both",
});

export const WithLabelLight = withLabelThemed.Light;
export const WithLabelDark = withLabelThemed.Dark;

const withLoadingBase: Story = {
	render: () => {
		const [searchValue, setSearchValue] = createSignal("");
		const [isLoading, setIsLoading] = createSignal(false);

		const filteredResults = () => {
			const term = searchValue().toLowerCase().trim();
			if (!term) return [];
			return mockResults.filter((item) =>
				item.primary.toLowerCase().includes(term),
			);
		};

		// Simulate debouncing with loading state
		const handleValueChange = (value: string) => {
			setSearchValue(value);
			setIsLoading(true);
			setTimeout(() => setIsLoading(false), 300);
		};

		return (
			<div class="h-96">
				<SearchInput
					value={searchValue()}
					onValueChange={handleValueChange}
					results={filteredResults()}
					isLoading={isLoading()}
					label="Search Frameworks"
					placeholder="Type to see loading state..."
				/>
				<div class="mt-4 text-sm text-on-surface-muted dark:text-on-surface-dark-muted">
					Notice the loading spinner appears when typing
				</div>
			</div>
		);
	},
};

const withLoadingThemed = createThemedStories({
	story: withLoadingBase,
	testMode: "both",
});

export const WithLoadingLight = withLoadingThemed.Light;
export const WithLoadingDark = withLoadingThemed.Dark;

const noResultsBase: Story = {
	render: () => {
		const [searchValue, setSearchValue] = createSignal("xyz123");

		return (
			<div class="h-96">
				<SearchInput
					value={searchValue()}
					onValueChange={setSearchValue}
					results={[]}
					label="Framework Search"
					placeholder="Search frameworks..."
				/>
				<div class="mt-4 text-sm text-on-surface-muted dark:text-on-surface-dark-muted">
					Shows "No results found" message for non-existent items
				</div>
			</div>
		);
	},
};

const noResultsThemed = createThemedStories({
	story: noResultsBase,
	testMode: "both",
});

export const NoResultsLight = noResultsThemed.Light;
export const NoResultsDark = noResultsThemed.Dark;

const customNoResultsBase: Story = {
	render: () => {
		const [searchValue, setSearchValue] = createSignal("xyz123");

		return (
			<div class="h-96">
				<SearchInput
					value={searchValue()}
					onValueChange={setSearchValue}
					results={[]}
					label="Framework Search"
					placeholder="Search frameworks..."
					noResultsMessage="No frameworks match your search. Try different keywords."
				/>
				<div class="mt-4 text-sm text-on-surface-muted dark:text-on-surface-dark-muted">
					Custom no results message
				</div>
			</div>
		);
	},
};

const customNoResultsThemed = createThemedStories({
	story: customNoResultsBase,
	testMode: "both",
});

export const CustomNoResultsLight = customNoResultsThemed.Light;
export const CustomNoResultsDark = customNoResultsThemed.Dark;

const withSelectionBase: Story = {
	render: () => {
		const [searchValue, setSearchValue] = createSignal("");

		const filteredResults = () => {
			const term = searchValue().toLowerCase().trim();
			if (!term) return [];
			return mockResults.filter((item) =>
				item.primary.toLowerCase().includes(term),
			);
		};

		const handleSelect = (item: SearchResultItem) => {
			console.log("Selected item:", item);
			alert(
				`Selected: ${item.primary}\\nDescription: ${item.secondary || "N/A"}`,
			);
		};

		return (
			<div class="h-96 space-y-4">
				<SearchInput
					value={searchValue()}
					onValueChange={setSearchValue}
					results={filteredResults()}
					onSelect={handleSelect}
					label="Framework Search"
					placeholder="Search frameworks..."
				/>
				<div class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted">
					Click an item in the dropdown to see selection callback
				</div>
			</div>
		);
	},
};

const withSelectionThemed = createThemedStories({
	story: withSelectionBase,
	testMode: "both",
});

export const WithSelectionLight = withSelectionThemed.Light;
export const WithSelectionDark = withSelectionThemed.Dark;

// Interactive story with tests
const interactiveBase: Story = {
	render: () => {
		const [searchValue, setSearchValue] = createSignal("");
		const [isLoading, setIsLoading] = createSignal(false);
		const [selectedItem, setSelectedItem] = createSignal<
			SearchResultItem | undefined
		>();

		const filteredResults = () => {
			const term = searchValue().toLowerCase().trim();
			if (!term) return [];
			return mockResults.filter((item) =>
				item.primary.toLowerCase().includes(term),
			);
		};

		const handleValueChange = (value: string) => {
			setSearchValue(value);
			setIsLoading(true);
			setTimeout(() => setIsLoading(false), 200);
		};

		const handleSelect = (item: SearchResultItem) => {
			setSelectedItem(item);
			console.log("Selected item:", item);
		};

		const handleClear = () => {
			setSelectedItem(undefined);
		};

		return (
			<div class="h-96 space-y-4">
				<SearchInput
					value={searchValue()}
					onValueChange={handleValueChange}
					results={filteredResults()}
					isLoading={isLoading()}
					onSelect={handleSelect}
					onClear={handleClear}
					label="Framework Search"
					placeholder="Search frameworks..."
				/>
				<div class="space-y-2 text-sm text-on-surface-muted dark:text-on-surface-dark-muted">
					<p>Try typing:</p>
					<ul class="list-disc list-inside">
						<li>"re" - shows React</li>
						<li>"vue" - shows Vue</li>
						<li>"sv" - shows Svelte</li>
						<li>"solid" - shows SolidJS</li>
					</ul>
					<p>Open console to see selection events</p>
					<p data-testid="selected-item">
						Selected: {selectedItem()?.primary || "None"}
					</p>
				</div>
			</div>
		);
	},
	play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const canvas = within(canvasElement);

		// Find the search input
		const input = canvas.getByPlaceholderText("Search frameworks...");

		// Type 'react' to trigger search
		await userEvent.type(input, "react");

		// Wait for results to appear
		await new Promise((resolve) => setTimeout(resolve, 300));

		// Click on the first result (should be 'React')
		const reactButton = canvas.getByText("React", {
			selector: ".font-semibold",
		});
		await userEvent.click(reactButton);

		// Verify selection was made
		const selectedText = canvas.getByTestId("selected-item");
		await expect(selectedText).toHaveTextContent("Selected: React");

		// Click clear button
		const clearButton = canvas.getByLabelText("Clear search");
		await userEvent.click(clearButton);

		// Verify input is cleared
		await expect(input).toHaveValue("");
	},
};

const interactiveThemed = createThemedStories({
	story: interactiveBase,
	testMode: "both",
});

export const InteractiveLight = interactiveThemed.Light;
export const InteractiveDark = interactiveThemed.Dark;

import { expect, userEvent, within } from "@storybook/test";
import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { type PackageResult, PackageSearchInput } from "./package-search-input";

// Mock package data for stories
const mockPackages: PackageResult[] = [
	{
		id: "1",
		name: "express",
		registry: "npm",
		description: "Fast, unopinionated, minimalist web framework for Node.js",
		homepage: "http://expressjs.com/",
		repository: "https://github.com/expressjs/express",
	},
	{
		id: "2",
		name: "react",
		registry: "npm",
		description: "React is a JavaScript library for building user interfaces",
		homepage: "https://react.dev/",
		repository: "https://github.com/facebook/react",
	},
	{
		id: "3",
		name: "lodash",
		registry: "npm",
		description: "Lodash modular utilities",
		homepage: "https://lodash.com/",
		repository: "https://github.com/lodash/lodash",
	},
	{
		id: "4",
		name: "axios",
		registry: "npm",
		description: "Promise based HTTP client for the browser and node.js",
		homepage: null,
		repository: "https://github.com/axios/axios",
	},
	{
		id: "5",
		name: "moment",
		registry: "npm",
		description: "Parse, validate, manipulate, and display dates",
		homepage: "http://momentjs.com",
		repository: null,
	},
];

const meta = {
	title: "Feature/Package Search/PackageSearchInput",
	component: PackageSearchInput,
	tags: ["autodocs"],
} satisfies Meta<typeof PackageSearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		const [searchValue, setSearchValue] = createSignal("");

		// Filter packages based on search value
		const filteredResults = () => {
			const term = searchValue().toLowerCase().trim();
			if (!term) return [];
			return mockPackages.filter((pkg) =>
				pkg.name.toLowerCase().includes(term),
			);
		};

		return (
			<div class="h-96">
				<PackageSearchInput
					value={searchValue()}
					onValueChange={setSearchValue}
					results={filteredResults()}
					placeholder="Search npm packages..."
				/>
				<div class="mt-4 text-sm text-on-surface-muted dark:text-on-surface-dark-muted">
					Type "express", "react", "lodash", "axios", or "moment" to see results
				</div>
			</div>
		);
	},
};

export const WithLabel: Story = {
	render: () => {
		const [searchValue, setSearchValue] = createSignal("");

		const filteredResults = () => {
			const term = searchValue().toLowerCase().trim();
			if (!term) return [];
			return mockPackages.filter((pkg) =>
				pkg.name.toLowerCase().includes(term),
			);
		};

		return (
			<div class="h-96">
				<PackageSearchInput
					value={searchValue()}
					onValueChange={setSearchValue}
					results={filteredResults()}
					label="Search Packages"
					placeholder="Type to search..."
				/>
			</div>
		);
	},
};

export const WithLoading: Story = {
	render: () => {
		const [searchValue, setSearchValue] = createSignal("");
		const [isLoading, setIsLoading] = createSignal(false);

		const filteredResults = () => {
			const term = searchValue().toLowerCase().trim();
			if (!term) return [];
			return mockPackages.filter((pkg) =>
				pkg.name.toLowerCase().includes(term),
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
				<PackageSearchInput
					value={searchValue()}
					onValueChange={handleValueChange}
					results={filteredResults()}
					isLoading={isLoading()}
					label="Search Packages"
					placeholder="Type to see loading state..."
				/>
				<div class="mt-4 text-sm text-on-surface-muted dark:text-on-surface-dark-muted">
					Notice the loading spinner appears when typing
				</div>
			</div>
		);
	},
};

export const NoResults: Story = {
	render: () => {
		const [searchValue, setSearchValue] = createSignal("xyz123");

		return (
			<div class="h-96">
				<PackageSearchInput
					value={searchValue()}
					onValueChange={setSearchValue}
					results={[]}
					label="Package Search"
					placeholder="Search packages..."
				/>
				<div class="mt-4 text-sm text-on-surface-muted dark:text-on-surface-dark-muted">
					Shows "No packages found" message for non-existent package
				</div>
			</div>
		);
	},
};

export const WithSelection: Story = {
	render: () => {
		const [searchValue, setSearchValue] = createSignal("");

		const filteredResults = () => {
			const term = searchValue().toLowerCase().trim();
			if (!term) return [];
			return mockPackages.filter((pkg) =>
				pkg.name.toLowerCase().includes(term),
			);
		};

		const handleSelect = (pkg: PackageResult) => {
			console.log("Selected package:", pkg);
			alert(`Selected: ${pkg.name}\nDescription: ${pkg.description || "N/A"}`);
		};

		return (
			<div class="h-96 space-y-4">
				<PackageSearchInput
					value={searchValue()}
					onValueChange={setSearchValue}
					results={filteredResults()}
					onPackageSelect={handleSelect}
					label="Package Search"
					placeholder="Search npm packages..."
				/>
				<div class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted">
					Click a package in the dropdown to see selection callback
				</div>
			</div>
		);
	},
};

// Example: Interactive story with tests
const interactiveBase: Story = {
	render: () => {
		const [searchValue, setSearchValue] = createSignal("");
		const [isLoading, setIsLoading] = createSignal(false);
		const [selectedPackage, setSelectedPackage] = createSignal<
			PackageResult | undefined
		>();

		const filteredResults = () => {
			const term = searchValue().toLowerCase().trim();
			if (!term) return [];
			return mockPackages.filter((pkg) =>
				pkg.name.toLowerCase().includes(term),
			);
		};

		const handleValueChange = (value: string) => {
			setSearchValue(value);
			setIsLoading(true);
			setTimeout(() => setIsLoading(false), 200);
		};

		const handleSelect = (pkg: PackageResult) => {
			setSelectedPackage(pkg);
			console.log("Selected package:", pkg);
		};

		const handleClear = () => {
			setSelectedPackage(undefined);
		};

		return (
			<div class="h-96 space-y-4">
				<PackageSearchInput
					value={searchValue()}
					onValueChange={handleValueChange}
					results={filteredResults()}
					isLoading={isLoading()}
					onPackageSelect={handleSelect}
					onClear={handleClear}
					label="Package Search"
					placeholder="Search npm packages..."
				/>
				<div class="space-y-2 text-sm text-on-surface-muted dark:text-on-surface-dark-muted">
					<p>Try typing:</p>
					<ul class="list-disc list-inside">
						<li>"ex" - shows express and axios</li>
						<li>"react" - shows react</li>
						<li>"lo" - shows lodash</li>
						<li>"moment" - shows moment</li>
					</ul>
					<p>Open console to see selection events</p>
					<p data-testid="selected-package">
						Selected: {selectedPackage()?.name || "None"}
					</p>
				</div>
			</div>
		);
	},
	play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const canvas = within(canvasElement);

		// Find the search input
		const input = canvas.getByPlaceholderText("Search npm packages...");

		// Type 'react' to trigger search
		await userEvent.type(input, "react");

		// Wait for results to appear
		await new Promise((resolve) => setTimeout(resolve, 300));

		// Click on the first result (should be 'react')
		const reactButton = canvas.getByText("react", {
			selector: ".font-semibold",
		});
		await userEvent.click(reactButton);

		// Verify selection was made
		const selectedText = canvas.getByTestId("selected-package");
		await expect(selectedText).toHaveTextContent("Selected: react");

		// Click clear button
		const clearButton = canvas.getByLabelText("Clear search");
		await userEvent.click(clearButton);

		// Verify input is cleared
		await expect(input).toHaveValue("");
	},
};

// Creates three stories: InteractiveLight (tested), InteractiveDark (not tested), Interactive (visible, not tested)
const interactiveThemed = createThemedStories({
	story: interactiveBase,
	testMode: "light", // Only test light mode
});

export const InteractiveLight = interactiveThemed.Light;
export const InteractiveDark = interactiveThemed.Dark;
export const Interactive = interactiveThemed.Playground;

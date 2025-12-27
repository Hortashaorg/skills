import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";

const meta: Meta<typeof EmptyState> = {
	title: "UI/EmptyState",
	component: EmptyState,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
		},
	},
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

const SearchIcon = () => (
	<svg
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		class="w-full h-full"
		aria-hidden="true"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
			d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
		/>
	</svg>
);

const PackageIcon = () => (
	<svg
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		class="w-full h-full"
		aria-hidden="true"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
			d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
		/>
	</svg>
);

export const Default: Story = {
	args: {
		title: "No results found",
		description:
			"Try adjusting your search or filters to find what you're looking for.",
	},
};

export const WithIcon: Story = {
	args: {
		icon: <SearchIcon />,
		title: "No packages found",
		description: "We couldn't find any packages matching your search.",
	},
};

export const WithAction: Story = {
	args: {
		icon: <PackageIcon />,
		title: "No packages yet",
		description: "Request a package to get started.",
		action: (
			<Button variant="primary" size="sm">
				Request Package
			</Button>
		),
	},
};

export const Small: Story = {
	args: {
		size: "sm",
		title: "No items",
		description: "Nothing to show here.",
	},
};

export const Large: Story = {
	args: {
		size: "lg",
		icon: <SearchIcon />,
		title: "No search results",
		description: "Try different keywords or remove some filters.",
		action: (
			<Button variant="outline" size="sm">
				Clear filters
			</Button>
		),
	},
};

export const TitleOnly: Story = {
	args: {
		title: "No data available",
	},
};

export const Dark: Story = {
	args: {
		icon: <SearchIcon />,
		title: "No results found",
		description: "Try adjusting your search criteria.",
		action: (
			<Button variant="primary" size="sm">
				Clear search
			</Button>
		),
	},
	parameters: {
		backgrounds: { default: "dark" },
	},
	decorators: [
		(Story) => (
			<div class="dark bg-surface-dark p-8 rounded-lg">
				<Story />
			</div>
		),
	],
};

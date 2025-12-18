import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Heading } from "./heading";

const meta = {
	title: "Primitives/Heading",
	component: Heading,
	tags: ["autodocs"],
	argTypes: {
		as: {
			control: "select",
			options: ["h1", "h2", "h3", "h4", "h5", "h6"],
			description: "HTML heading element",
		},
		level: {
			control: "select",
			options: ["h1", "h2", "h3", "h4", "h5", "h6"],
			description: "Visual styling level (can differ from semantic element)",
		},
		color: {
			control: "select",
			options: ["default", "primary", "muted"],
			description: "Text color",
		},
	},
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H1: Story = {
	args: {
		level: "h1",
		children: "Heading 1",
	},
};

export const H2: Story = {
	args: {
		level: "h2",
		children: "Heading 2",
	},
};

export const H3: Story = {
	args: {
		level: "h3",
		children: "Heading 3",
	},
};

export const H4: Story = {
	args: {
		level: "h4",
		children: "Heading 4",
	},
};

export const H5: Story = {
	args: {
		level: "h5",
		children: "Heading 5",
	},
};

export const H6: Story = {
	args: {
		level: "h6",
		children: "Heading 6",
	},
};

export const AllLevels: Story = {
	render: () => (
		<div class="space-y-4">
			<Heading level="h1">Heading 1 (4xl → 5xl)</Heading>
			<Heading level="h2">Heading 2 (3xl → 4xl) - Default</Heading>
			<Heading level="h3">Heading 3 (2xl → 3xl)</Heading>
			<Heading level="h4">Heading 4 (xl → 2xl)</Heading>
			<Heading level="h5">Heading 5 (lg → xl)</Heading>
			<Heading level="h6">Heading 6 (base → lg)</Heading>
		</div>
	),
};

export const Colors: Story = {
	render: () => (
		<div class="space-y-4">
			<Heading level="h2" color="default">
				Default color (on-surface-strong)
			</Heading>
			<Heading level="h2" color="primary">
				Primary color
			</Heading>
			<Heading level="h2" color="muted">
				Muted color (on-surface)
			</Heading>
		</div>
	),
};

export const SemanticVsVisual: Story = {
	render: () => (
		<div class="space-y-4">
			<div>
				<p class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted mb-2">
					Semantic h1, styled as h1
				</p>
				<Heading as="h1" level="h1">
					This is semantically h1
				</Heading>
			</div>
			<div>
				<p class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted mb-2">
					Semantic h2, styled as h1 (larger visual)
				</p>
				<Heading as="h2" level="h1">
					This is semantically h2, but looks like h1
				</Heading>
			</div>
			<div>
				<p class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted mb-2">
					Semantic h1, styled as h3 (smaller visual)
				</p>
				<Heading as="h1" level="h3">
					This is semantically h1, but looks like h3
				</Heading>
			</div>
		</div>
	),
};

export const WithCustomClass: Story = {
	render: () => (
		<Heading level="h2" class="italic" color="primary">
			Heading with custom class
		</Heading>
	),
};

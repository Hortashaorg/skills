import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Flex } from "./flex";

const meta = {
	title: "Primitives/Flex",
	component: Flex,
	tags: ["autodocs"],
	argTypes: {
		direction: {
			control: "select",
			options: ["row", "column", "rowReverse", "columnReverse"],
			description: "Flex direction",
		},
		align: {
			control: "select",
			options: ["start", "center", "end", "stretch", "baseline"],
			description: "Align items",
		},
		justify: {
			control: "select",
			options: ["start", "center", "end", "between", "around", "evenly"],
			description: "Justify content",
		},
		wrap: {
			control: "select",
			options: ["nowrap", "wrap", "wrapReverse"],
			description: "Flex wrap",
		},
		gap: {
			control: "select",
			options: ["none", "xs", "sm", "md", "lg", "xl"],
			description: "Gap between items",
		},
	},
} satisfies Meta<typeof Flex>;

export default meta;
type Story = StoryObj<typeof meta>;

import type { JSX } from "solid-js";

const Box = (props: { children?: JSX.Element; color?: string }) => (
	<div
		class={`p-4 rounded-radius ${props.color || "bg-primary dark:bg-primary-dark"} text-on-primary dark:text-on-primary-dark`}
	>
		{props.children || "Box"}
	</div>
);

export const Row: Story = {
	render: () => (
		<Flex direction="row" gap="md">
			<Box>1</Box>
			<Box>2</Box>
			<Box>3</Box>
		</Flex>
	),
};

export const Column: Story = {
	render: () => (
		<Flex direction="column" gap="md">
			<Box>1</Box>
			<Box>2</Box>
			<Box>3</Box>
		</Flex>
	),
};

export const CenterAligned: Story = {
	render: () => (
		<Flex align="center" justify="center" gap="md" class="h-48">
			<Box>Centered</Box>
			<Box>Content</Box>
		</Flex>
	),
};

export const SpaceBetween: Story = {
	render: () => (
		<Flex justify="between" gap="md">
			<Box>Start</Box>
			<Box>Middle</Box>
			<Box>End</Box>
		</Flex>
	),
};

export const Wrap: Story = {
	render: () => (
		<Flex wrap="wrap" gap="md" class="max-w-md">
			<Box>1</Box>
			<Box>2</Box>
			<Box>3</Box>
			<Box>4</Box>
			<Box>5</Box>
			<Box>6</Box>
		</Flex>
	),
};

export const WithGaps: Story = {
	render: () => (
		<div class="space-y-6">
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					No gap
				</p>
				<Flex gap="none">
					<Box>1</Box>
					<Box>2</Box>
					<Box>3</Box>
				</Flex>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					XS gap (gap-1)
				</p>
				<Flex gap="xs">
					<Box>1</Box>
					<Box>2</Box>
					<Box>3</Box>
				</Flex>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					SM gap (gap-2)
				</p>
				<Flex gap="sm">
					<Box>1</Box>
					<Box>2</Box>
					<Box>3</Box>
				</Flex>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					MD gap (gap-4)
				</p>
				<Flex gap="md">
					<Box>1</Box>
					<Box>2</Box>
					<Box>3</Box>
				</Flex>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					LG gap (gap-6)
				</p>
				<Flex gap="lg">
					<Box>1</Box>
					<Box>2</Box>
					<Box>3</Box>
				</Flex>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					XL gap (gap-8)
				</p>
				<Flex gap="xl">
					<Box>1</Box>
					<Box>2</Box>
					<Box>3</Box>
				</Flex>
			</div>
		</div>
	),
};

export const AllAlignments: Story = {
	render: () => (
		<div class="space-y-6">
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					Align start
				</p>
				<Flex
					align="start"
					gap="md"
					class="h-32 bg-surface-alt dark:bg-surface-dark-alt"
				>
					<Box>1</Box>
					<Box>2</Box>
				</Flex>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					Align center
				</p>
				<Flex
					align="center"
					gap="md"
					class="h-32 bg-surface-alt dark:bg-surface-dark-alt"
				>
					<Box>1</Box>
					<Box>2</Box>
				</Flex>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					Align end
				</p>
				<Flex
					align="end"
					gap="md"
					class="h-32 bg-surface-alt dark:bg-surface-dark-alt"
				>
					<Box>1</Box>
					<Box>2</Box>
				</Flex>
			</div>
		</div>
	),
};

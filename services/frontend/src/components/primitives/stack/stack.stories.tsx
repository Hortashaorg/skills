import type { JSX } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Stack } from "./stack";

const meta = {
	title: "Primitives/Stack",
	component: Stack,
	tags: ["autodocs"],
	argTypes: {
		direction: {
			control: "select",
			options: ["vertical", "horizontal"],
			description: "Stack direction",
		},
		spacing: {
			control: "select",
			options: ["none", "xs", "sm", "md", "lg", "xl"],
			description: "Spacing between items",
		},
		align: {
			control: "select",
			options: ["start", "center", "end", "stretch"],
			description: "Align items",
		},
	},
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

const Box = (props: { children?: JSX.Element }) => (
	<div class="p-4 bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark rounded-radius">
		{props.children || "Item"}
	</div>
);

export const Vertical: Story = {
	render: () => (
		<Stack direction="vertical" spacing="md">
			<Box>Item 1</Box>
			<Box>Item 2</Box>
			<Box>Item 3</Box>
		</Stack>
	),
};

export const Horizontal: Story = {
	render: () => (
		<Stack direction="horizontal" spacing="md">
			<Box>Item 1</Box>
			<Box>Item 2</Box>
			<Box>Item 3</Box>
		</Stack>
	),
};

export const CenterAligned: Story = {
	render: () => (
		<Stack align="center" spacing="md">
			<Box>Centered Item 1</Box>
			<Box>Centered Item 2</Box>
			<Box>Centered Item 3</Box>
		</Stack>
	),
};

export const AllSpacings: Story = {
	render: () => (
		<div class="space-y-8">
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					No spacing (gap-0)
				</p>
				<Stack spacing="none">
					<Box>1</Box>
					<Box>2</Box>
					<Box>3</Box>
				</Stack>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					XS spacing (gap-1)
				</p>
				<Stack spacing="xs">
					<Box>1</Box>
					<Box>2</Box>
					<Box>3</Box>
				</Stack>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					SM spacing (gap-2)
				</p>
				<Stack spacing="sm">
					<Box>1</Box>
					<Box>2</Box>
					<Box>3</Box>
				</Stack>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					MD spacing (gap-4) - Default
				</p>
				<Stack spacing="md">
					<Box>1</Box>
					<Box>2</Box>
					<Box>3</Box>
				</Stack>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					LG spacing (gap-6)
				</p>
				<Stack spacing="lg">
					<Box>1</Box>
					<Box>2</Box>
					<Box>3</Box>
				</Stack>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					XL spacing (gap-8)
				</p>
				<Stack spacing="xl">
					<Box>1</Box>
					<Box>2</Box>
					<Box>3</Box>
				</Stack>
			</div>
		</div>
	),
};

export const AllAlignments: Story = {
	render: () => (
		<div class="space-y-8">
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					Align start
				</p>
				<Stack align="start" spacing="md">
					<Box>Item 1</Box>
					<Box>Item 2</Box>
				</Stack>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					Align center
				</p>
				<Stack align="center" spacing="md">
					<Box>Item 1</Box>
					<Box>Item 2</Box>
				</Stack>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					Align end
				</p>
				<Stack align="end" spacing="md">
					<Box>Item 1</Box>
					<Box>Item 2</Box>
				</Stack>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					Align stretch (default)
				</p>
				<Stack align="stretch" spacing="md">
					<Box>Item 1</Box>
					<Box>Item 2</Box>
				</Stack>
			</div>
		</div>
	),
};

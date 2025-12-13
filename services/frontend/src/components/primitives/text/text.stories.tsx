import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Text } from "./text";

const meta = {
	title: "Primitives/Text",
	component: Text,
	tags: ["autodocs"],
	argTypes: {
		as: {
			control: "select",
			options: ["p", "span", "div"],
			description: "HTML element to render",
		},
		size: {
			control: "select",
			options: ["xs", "sm", "base", "lg", "xl"],
			description: "Text size",
		},
		weight: {
			control: "select",
			options: ["normal", "medium", "semibold", "bold"],
			description: "Font weight",
		},
		color: {
			control: "select",
			options: [
				"default",
				"strong",
				"muted",
				"primary",
				"danger",
				"success",
				"warning",
				"info",
			],
			description: "Text color",
		},
	},
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: "This is default text",
	},
};

export const Sizes: Story = {
	render: () => (
		<div class="space-y-2">
			<Text size="xs">Extra small text (text-xs)</Text>
			<Text size="sm">Small text (text-sm)</Text>
			<Text size="base">Base text (text-base) - Default</Text>
			<Text size="lg">Large text (text-lg)</Text>
			<Text size="xl">Extra large text (text-xl)</Text>
		</div>
	),
};

export const Weights: Story = {
	render: () => (
		<div class="space-y-2">
			<Text weight="normal">Normal weight (font-normal) - Default</Text>
			<Text weight="medium">Medium weight (font-medium)</Text>
			<Text weight="semibold">Semibold weight (font-semibold)</Text>
			<Text weight="bold">Bold weight (font-bold)</Text>
		</div>
	),
};

export const Colors: Story = {
	render: () => (
		<div class="space-y-2">
			<Text color="default">Default color (on-surface)</Text>
			<Text color="strong">Strong color (on-surface-strong)</Text>
			<Text color="muted">Muted color (on-surface with opacity)</Text>
			<Text color="primary">Primary color</Text>
			<Text color="danger">Danger color</Text>
			<Text color="success">Success color</Text>
			<Text color="warning">Warning color</Text>
			<Text color="info">Info color</Text>
		</div>
	),
};

export const PolymorphicElements: Story = {
	render: () => (
		<div class="space-y-2">
			<Text as="p">
				Paragraph element (default) - This is a paragraph of text
			</Text>
			<Text as="span">Span element - Inline text</Text>
			<Text as="div">Div element - Block text</Text>
		</div>
	),
};

export const CombinedVariants: Story = {
	render: () => (
		<div class="space-y-4">
			<Text size="xl" weight="bold" color="primary">
				Large, bold, primary text
			</Text>
			<Text size="sm" weight="medium" color="muted">
				Small, medium weight, muted text
			</Text>
			<Text size="base" weight="semibold" color="success">
				Base size, semibold, success color
			</Text>
		</div>
	),
};

export const WithCustomClass: Story = {
	render: () => (
		<Text class="italic underline" color="primary">
			Text with custom classes (italic, underline)
		</Text>
	),
};

import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { Input } from "./input";

const meta = {
	title: "Primitives/Input",
	component: Input,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
			description: "Input size",
		},
		placeholder: {
			control: "text",
			description: "Placeholder text",
		},
		disabled: {
			control: "boolean",
			description: "Disabled state",
		},
	},
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultBase: Story = {
	args: {
		placeholder: "Enter text...",
	},
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "both",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

const smallBase: Story = {
	args: {
		size: "sm",
		placeholder: "Small input...",
	},
};

const smallThemed = createThemedStories({
	story: smallBase,
	testMode: "both",
});

export const SmallLight = smallThemed.Light;
export const SmallDark = smallThemed.Dark;

const largeBase: Story = {
	args: {
		size: "lg",
		placeholder: "Large input...",
	},
};

const largeThemed = createThemedStories({
	story: largeBase,
	testMode: "both",
});

export const LargeLight = largeThemed.Light;
export const LargeDark = largeThemed.Dark;

const disabledBase: Story = {
	args: {
		placeholder: "Disabled input...",
		disabled: true,
	},
};

const disabledThemed = createThemedStories({
	story: disabledBase,
	testMode: "both",
});

export const DisabledLight = disabledThemed.Light;
export const DisabledDark = disabledThemed.Dark;

const withValueBase: Story = {
	args: {
		value: "Hello, World!",
		placeholder: "Enter text...",
	},
};

const withValueThemed = createThemedStories({
	story: withValueBase,
	testMode: "both",
});

export const WithValueLight = withValueThemed.Light;
export const WithValueDark = withValueThemed.Dark;

const allSizesBase: Story = {
	render: () => (
		<div class="flex flex-col gap-4 w-80">
			<Input size="sm" placeholder="Small input..." />
			<Input size="md" placeholder="Medium input..." />
			<Input size="lg" placeholder="Large input..." />
		</div>
	),
};

const allSizesThemed = createThemedStories({
	story: allSizesBase,
	testMode: "light",
});

export const AllSizesLight = allSizesThemed.Light;
export const AllSizesDark = allSizesThemed.Dark;

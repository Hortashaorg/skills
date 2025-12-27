import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { Spinner } from "./spinner";

const meta = {
	title: "UI/Spinner",
	component: Spinner,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
			description: "Size of the spinner",
		},
		label: {
			control: "text",
			description: "Optional visible label text",
		},
		srText: {
			control: "text",
			description: "Screen reader text (defaults to 'Loading')",
		},
	},
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultBase: Story = {
	args: {},
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "both",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

const withLabelBase: Story = {
	args: {
		label: "Loading...",
	},
};

const withLabelThemed = createThemedStories({
	story: withLabelBase,
	testMode: "both",
});

export const WithLabelLight = withLabelThemed.Light;
export const WithLabelDark = withLabelThemed.Dark;

const smallBase: Story = {
	args: {
		size: "sm",
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
		label: "Loading packages...",
	},
};

const largeThemed = createThemedStories({
	story: largeBase,
	testMode: "both",
});

export const LargeLight = largeThemed.Light;
export const LargeDark = largeThemed.Dark;

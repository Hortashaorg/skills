import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { ErrorFallback } from "./error-fallback";

const meta = {
	title: "Composite/ErrorFallback",
	component: ErrorFallback,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
	},
	argTypes: {
		error: {
			description: "The error object to display",
		},
		reset: {
			description: "Function to reset the error state",
			action: "reset",
		},
	},
} satisfies Meta<typeof ErrorFallback>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultErrorBase: Story = {
	args: {
		error: new Error("Failed to fetch package data"),
		reset: () => {},
	},
};

const defaultErrorThemed = createThemedStories({
	story: defaultErrorBase,
	testMode: "both",
});

export const DefaultLight = defaultErrorThemed.Light;
export const DefaultDark = defaultErrorThemed.Dark;

const networkErrorBase: Story = {
	args: {
		error: new Error("Network request failed: Unable to connect to server"),
		reset: () => {},
	},
};

const networkErrorThemed = createThemedStories({
	story: networkErrorBase,
	testMode: "both",
});

export const NetworkErrorLight = networkErrorThemed.Light;
export const NetworkErrorDark = networkErrorThemed.Dark;

const longErrorBase: Story = {
	args: {
		error: new Error(
			"TypeError: Cannot read properties of undefined (reading 'map') at PackageList.render (packages.tsx:42:15)",
		),
		reset: () => {},
	},
};

const longErrorThemed = createThemedStories({
	story: longErrorBase,
	testMode: "both",
});

export const LongErrorMessageLight = longErrorThemed.Light;
export const LongErrorMessageDark = longErrorThemed.Dark;

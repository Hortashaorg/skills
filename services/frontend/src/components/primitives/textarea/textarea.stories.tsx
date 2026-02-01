import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { Textarea } from "./textarea";

const meta = {
	title: "Primitives/Textarea",
	component: Textarea,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
			description: "Textarea size",
		},
		resizable: {
			control: "boolean",
			description: "Allow vertical resizing",
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
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default
const defaultBase: Story = {
	args: {
		placeholder: "Enter text...",
		rows: 3,
	},
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "both",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

// Small size
const smallBase: Story = {
	args: {
		size: "sm",
		placeholder: "Small textarea",
		rows: 3,
	},
};

const smallThemed = createThemedStories({
	story: smallBase,
	testMode: "both",
});

export const SmallLight = smallThemed.Light;
export const SmallDark = smallThemed.Dark;

// Large size
const largeBase: Story = {
	args: {
		size: "lg",
		placeholder: "Large textarea",
		rows: 3,
	},
};

const largeThemed = createThemedStories({
	story: largeBase,
	testMode: "both",
});

export const LargeLight = largeThemed.Light;
export const LargeDark = largeThemed.Dark;

// Resizable
const resizableBase: Story = {
	args: {
		resizable: true,
		placeholder: "Resizable textarea (drag corner)",
		rows: 3,
	},
};

const resizableThemed = createThemedStories({
	story: resizableBase,
	testMode: "both",
});

export const ResizableLight = resizableThemed.Light;
export const ResizableDark = resizableThemed.Dark;

// Disabled
const disabledBase: Story = {
	args: {
		disabled: true,
		placeholder: "Disabled textarea",
		rows: 3,
	},
};

const disabledThemed = createThemedStories({
	story: disabledBase,
	testMode: "both",
});

export const DisabledLight = disabledThemed.Light;
export const DisabledDark = disabledThemed.Dark;

// With content
const withContentBase: Story = {
	args: {
		value:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		rows: 4,
		"aria-label": "Example textarea with content",
	},
};

const withContentThemed = createThemedStories({
	story: withContentBase,
	testMode: "light",
});

export const WithContentLight = withContentThemed.Light;
export const WithContentDark = withContentThemed.Dark;

// Code variant (monospace, no spellcheck)
const codeBase: Story = {
	args: {
		variant: "code",
		placeholder: "// Write code here...",
		rows: 5,
	},
};

const codeThemed = createThemedStories({
	story: codeBase,
	testMode: "both",
});

export const CodeLight = codeThemed.Light;
export const CodeDark = codeThemed.Dark;

// All sizes showcase
const allSizesBase: Story = {
	render: () => (
		<div class="flex flex-col gap-4">
			<div>
				<p class="mb-2 text-sm text-on-surface dark:text-on-surface-dark">
					Small
				</p>
				<Textarea size="sm" placeholder="Small size" rows={2} />
			</div>
			<div>
				<p class="mb-2 text-sm text-on-surface dark:text-on-surface-dark">
					Medium (default)
				</p>
				<Textarea size="md" placeholder="Medium size" rows={2} />
			</div>
			<div>
				<p class="mb-2 text-sm text-on-surface dark:text-on-surface-dark">
					Large
				</p>
				<Textarea size="lg" placeholder="Large size" rows={2} />
			</div>
		</div>
	),
};

const allSizesThemed = createThemedStories({
	story: allSizesBase,
	testMode: "light",
});

export const AllSizesLight = allSizesThemed.Light;
export const AllSizesDark = allSizesThemed.Dark;

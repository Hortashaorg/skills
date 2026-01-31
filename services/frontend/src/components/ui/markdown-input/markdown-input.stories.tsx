import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { MarkdownInput } from "./markdown-input";

const meta = {
	title: "UI/MarkdownInput",
	component: MarkdownInput,
	tags: ["autodocs"],
	argTypes: {
		value: {
			control: "text",
			description: "Current markdown content",
		},
		placeholder: {
			control: "text",
			description: "Placeholder text when empty",
		},
		disabled: {
			control: "boolean",
			description: "Whether the input is disabled",
		},
	},
} satisfies Meta<typeof MarkdownInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultBase: Story = {
	render: () => {
		const [value, setValue] = createSignal("");
		return (
			<MarkdownInput
				value={value()}
				onInput={setValue}
				placeholder="Write your markdown here..."
				class="w-full min-h-32"
			/>
		);
	},
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "both",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

const withContentBase: Story = {
	render: () => {
		const [value, setValue] = createSignal(`# Hello World

This is some **bold** and *italic* text.

\`\`\`typescript
const greeting = "Hello!";
\`\`\`
`);
		return (
			<MarkdownInput
				value={value()}
				onInput={setValue}
				class="w-full min-h-48"
			/>
		);
	},
};

const withContentThemed = createThemedStories({
	story: withContentBase,
	testMode: "both",
});

export const WithContentLight = withContentThemed.Light;
export const WithContentDark = withContentThemed.Dark;

const disabledBase: Story = {
	render: () => {
		return (
			<MarkdownInput
				value="This input is disabled"
				onInput={() => {}}
				disabled
				class="w-full min-h-32"
			/>
		);
	},
};

const disabledThemed = createThemedStories({
	story: disabledBase,
	testMode: "both",
});

export const DisabledLight = disabledThemed.Light;
export const DisabledDark = disabledThemed.Dark;

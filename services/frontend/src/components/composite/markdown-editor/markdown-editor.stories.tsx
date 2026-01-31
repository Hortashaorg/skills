import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { MarkdownEditor } from "./markdown-editor";

const meta = {
	title: "Composite/MarkdownEditor",
	component: MarkdownEditor,
	tags: ["autodocs"],
	argTypes: {
		submitLabel: {
			control: "text",
			description: "Label for submit button",
		},
		cancelLabel: {
			control: "text",
			description: "Label for cancel button",
		},
		placeholder: {
			control: "text",
			description: "Placeholder text",
		},
	},
} satisfies Meta<typeof MarkdownEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// Note: Controlled inputs have cursor-jump issues in Storybook due to its re-render cycle.
// This is a Storybook limitation, not a component bug. Test interactive behavior in the real app.

const defaultBase: Story = {
	render: () => {
		const [value, setValue] = createSignal("");
		return (
			<MarkdownEditor
				value={value()}
				onInput={setValue}
				onSubmit={() => console.log("Submit:", value())}
				placeholder="Write something..."
				class="max-w-2xl"
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
console.log(greeting);
\`\`\`
`);
		return (
			<MarkdownEditor
				value={value()}
				onInput={setValue}
				onSubmit={() => console.log("Submit:", value())}
				onCancel={() => console.log("Cancel")}
				submitLabel="Save"
				cancelLabel="Discard"
				placeholder="Write something..."
				class="max-w-2xl"
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

const commentStyleBase: Story = {
	render: () => {
		const [value, setValue] = createSignal("");
		return (
			<MarkdownEditor
				value={value()}
				onInput={setValue}
				onSubmit={() => console.log("Comment:", value())}
				submitLabel="Comment"
				placeholder="Write a comment..."
				minHeight="min-h-24"
				class="max-w-2xl"
			/>
		);
	},
};

const commentStyleThemed = createThemedStories({
	story: commentStyleBase,
	testMode: "both",
});

export const CommentStyleLight = commentStyleThemed.Light;
export const CommentStyleDark = commentStyleThemed.Dark;

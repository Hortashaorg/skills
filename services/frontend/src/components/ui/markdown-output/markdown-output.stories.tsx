import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { MarkdownOutput } from "./markdown-output";

const meta = {
	title: "UI/MarkdownOutput",
	component: MarkdownOutput,
	tags: ["autodocs"],
	argTypes: {
		content: {
			control: "text",
			description: "Raw markdown content to render",
		},
	},
} satisfies Meta<typeof MarkdownOutput>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicMarkdown = `# Hello World

This is a **bold** statement and this is *italic*.

Here's a [link](https://example.com) to somewhere.`;

const basicBase: Story = {
	args: {
		content: basicMarkdown,
	},
};

const basicThemed = createThemedStories({
	story: basicBase,
	testMode: "both",
});

export const BasicLight = basicThemed.Light;
export const BasicDark = basicThemed.Dark;

const codeBlockMarkdown = `## Code Example

Here's some inline \`code\` in a sentence.

\`\`\`typescript
import { createSignal } from "solid-js";

const [count, setCount] = createSignal(0);

function increment() {
  setCount(c => c + 1);
}
\`\`\`

And here's some JavaScript:

\`\`\`javascript
const greeting = "Hello, world!";
console.log(greeting);
\`\`\``;

const codeBlockBase: Story = {
	args: {
		content: codeBlockMarkdown,
	},
};

const codeBlockThemed = createThemedStories({
	story: codeBlockBase,
	testMode: "both",
});

export const CodeBlockLight = codeBlockThemed.Light;
export const CodeBlockDark = codeBlockThemed.Dark;

const listsMarkdown = `## Lists

### Unordered List
- First item
- Second item
- Third item with **bold**

### Ordered List
1. Step one
2. Step two
3. Step three

### Task List
- [x] Completed task
- [ ] Pending task
- [ ] Another pending task`;

const listsBase: Story = {
	args: {
		content: listsMarkdown,
	},
};

const listsThemed = createThemedStories({
	story: listsBase,
	testMode: "both",
});

export const ListsLight = listsThemed.Light;
export const ListsDark = listsThemed.Dark;

const blockquoteMarkdown = `## Blockquotes

> This is a blockquote. It can contain **formatted** text.
>
> It can span multiple paragraphs.

Regular text after the quote.`;

const blockquoteBase: Story = {
	args: {
		content: blockquoteMarkdown,
	},
};

const blockquoteThemed = createThemedStories({
	story: blockquoteBase,
	testMode: "both",
});

export const BlockquoteLight = blockquoteThemed.Light;
export const BlockquoteDark = blockquoteThemed.Dark;

const tableMarkdown = `## Tables

| Package | Version | Downloads |
|---------|---------|-----------|
| react | 18.2.0 | 10M |
| vue | 3.3.4 | 5M |
| solid-js | 1.8.0 | 500K |`;

const tableBase: Story = {
	args: {
		content: tableMarkdown,
	},
};

const tableThemed = createThemedStories({
	story: tableBase,
	testMode: "both",
});

export const TableLight = tableThemed.Light;
export const TableDark = tableThemed.Dark;

const mentionsMarkdown = `## Mentions

Hey @sarah_dev, can you review this?

Thanks @mike_js for the help!`;

const mentionsBase: Story = {
	args: {
		content: mentionsMarkdown,
	},
};

const mentionsThemed = createThemedStories({
	story: mentionsBase,
	testMode: "both",
});

export const MentionsLight = mentionsThemed.Light;
export const MentionsDark = mentionsThemed.Dark;

const commentStyleMarkdown = `> I had the same issue! The fix is to add this to your \`bunfig.toml\`:

\`\`\`toml
[install]
peer = false
\`\`\`

Then reinstall. Worked for me.`;

const commentStyleBase: Story = {
	args: {
		content: commentStyleMarkdown,
	},
};

const commentStyleThemed = createThemedStories({
	story: commentStyleBase,
	testMode: "both",
});

export const CommentStyleLight = commentStyleThemed.Light;
export const CommentStyleDark = commentStyleThemed.Dark;

const allFeaturesMarkdown = `# Full Feature Demo

This showcases **all** markdown features in one place.

## Text Formatting

Regular text with **bold**, *italic*, and \`inline code\`.

## Links and Mentions

Check out [this link](https://example.com) or ping @username.

## Code Block

\`\`\`typescript
interface User {
  name: string;
  email: string;
}

const user: User = {
  name: "John",
  email: "john@example.com"
};
\`\`\`

## Lists

- Item one
- Item two
  - Nested item

1. First
2. Second

## Blockquote

> This is quoted text that spans
> multiple lines.

## Table

| Name | Type |
|------|------|
| id | uuid |
| name | text |

---

*End of demo*`;

const allFeaturesBase: Story = {
	args: {
		content: allFeaturesMarkdown,
	},
};

const allFeaturesThemed = createThemedStories({
	story: allFeaturesBase,
	testMode: "light",
});

export const AllFeaturesLight = allFeaturesThemed.Light;
export const AllFeaturesDark = allFeaturesThemed.Dark;

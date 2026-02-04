import type { Meta, StoryObj } from "storybook-solidjs-vite";
import type { EntityByIds } from "@/components/composite/markdown-editor";
import { createThemedStories } from "@/components/story-helpers";
import { CommentCard } from "./comment-card";

// Mock byIds for stories
const createMockByIds = (): EntityByIds => ({
	packages: () => new Map(),
	ecosystems: () => new Map(),
	projects: () => new Map(),
	users: () => new Map(),
});

const meta = {
	title: "Composite/CommentCard",
	component: CommentCard,
	tags: ["autodocs"],
} satisfies Meta<typeof CommentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultBase: Story = {
	args: {
		author: "sarah_dev",
		timestamp: "2 hours ago",
		content: `Has anyone tried using this package with **Bun**? I'm getting some weird behavior with the ESM imports.

\`\`\`typescript
import { createClient } from "@package/core";
const client = createClient({ timeout: 5000 });
\`\`\`

Any ideas?`,
		onReply: () => console.log("Reply clicked"),
		byIds: createMockByIds(),
	},
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "both",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

const withReplyToBase: Story = {
	args: {
		author: "mike_js",
		timestamp: "1 hour ago",
		replyToAuthor: "sarah_dev",
		content: `I had the same issue! The fix is to add this to your \`bunfig.toml\`:

\`\`\`toml
[install]
peer = false
\`\`\`

Then reinstall. Worked for me.`,
		onReply: () => console.log("Reply clicked"),
		byIds: createMockByIds(),
	},
};

const withReplyToThemed = createThemedStories({
	story: withReplyToBase,
	testMode: "both",
});

export const WithReplyToLight = withReplyToThemed.Light;
export const WithReplyToDark = withReplyToThemed.Dark;

const editableBase: Story = {
	args: {
		author: "sarah_dev",
		timestamp: "45 min ago",
		editedAt: "40 min ago",
		content: `> Then reinstall. Worked for me.

That worked! Thanks so much. Should we open an issue about this?`,
		onEdit: () => console.log("Edit clicked"),
		onDelete: () => console.log("Delete clicked"),
		onReply: () => console.log("Reply clicked"),
		byIds: createMockByIds(),
	},
};

const editableThemed = createThemedStories({
	story: editableBase,
	testMode: "both",
});

export const EditableLight = editableThemed.Light;
export const EditableDark = editableThemed.Dark;

const deletedBase: Story = {
	args: {
		author: "deleted_user",
		timestamp: "3 hours ago",
		content: "",
		isDeleted: true,
		byIds: createMockByIds(),
	},
};

const deletedThemed = createThemedStories({
	story: deletedBase,
	testMode: "both",
});

export const DeletedLight = deletedThemed.Light;
export const DeletedDark = deletedThemed.Dark;

const withAvatarLayoutBase: Story = {
	name: "With Avatar Layout (Example)",
	render: () => (
		<div class="flex gap-3">
			<div class="shrink-0 w-10 h-10 rounded-full bg-primary/20 dark:bg-primary-dark/20 text-primary dark:text-primary-dark flex items-center justify-center font-medium text-sm">
				S
			</div>
			<div class="flex-1 min-w-0">
				<CommentCard
					author="sarah_dev"
					timestamp="2 hours ago"
					content={`This shows how the card looks when composed with an avatar in the parent layout.

The avatar is **not** part of the CommentCard - the parent controls positioning.`}
					onReply={() => console.log("Reply clicked")}
					onEdit={() => console.log("Edit clicked")}
					byIds={createMockByIds()}
				/>
			</div>
		</div>
	),
};

const withAvatarLayoutThemed = createThemedStories({
	story: withAvatarLayoutBase,
	testMode: "both",
});

export const WithAvatarLayoutLight = withAvatarLayoutThemed.Light;
export const WithAvatarLayoutDark = withAvatarLayoutThemed.Dark;

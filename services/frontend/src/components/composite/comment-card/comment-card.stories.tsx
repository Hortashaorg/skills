import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { CommentCard } from "./comment-card";

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
		avatar: "S",
		timestamp: "2 hours ago",
		content: `Has anyone tried using this package with **Bun**? I'm getting some weird behavior with the ESM imports.

\`\`\`typescript
import { createClient } from "@package/core";
const client = createClient({ timeout: 5000 });
\`\`\`

Any ideas?`,
		onReply: () => console.log("Reply clicked"),
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
		avatar: "M",
		timestamp: "1 hour ago",
		replyToAuthor: "sarah_dev",
		content: `I had the same issue! The fix is to add this to your \`bunfig.toml\`:

\`\`\`toml
[install]
peer = false
\`\`\`

Then reinstall. Worked for me.`,
		size: "sm",
		onReply: () => console.log("Reply clicked"),
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
		avatar: "S",
		timestamp: "45 min ago",
		editedAt: "40 min ago",
		content: `> Then reinstall. Worked for me.

That worked! Thanks so much. Should we open an issue about this?`,
		onEdit: () => console.log("Edit clicked"),
		onDelete: () => console.log("Delete clicked"),
		onReply: () => console.log("Reply clicked"),
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
		avatar: "?",
		timestamp: "3 hours ago",
		content: "",
		isDeleted: true,
	},
};

const deletedThemed = createThemedStories({
	story: deletedBase,
	testMode: "both",
});

export const DeletedLight = deletedThemed.Light;
export const DeletedDark = deletedThemed.Dark;

const smallSizeBase: Story = {
	args: {
		author: "alex_maintainer",
		avatar: "A",
		timestamp: "30 min ago",
		content: "Great catch! I've added this to the docs in the latest release.",
		size: "sm",
		onReply: () => console.log("Reply clicked"),
	},
};

const smallSizeThemed = createThemedStories({
	story: smallSizeBase,
	testMode: "both",
});

export const SmallSizeLight = smallSizeThemed.Light;
export const SmallSizeDark = smallSizeThemed.Dark;

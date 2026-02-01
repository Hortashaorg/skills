import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { CommentThread } from "./comment-thread";

const meta = {
	title: "Composite/CommentThread",
	component: CommentThread,
	tags: ["autodocs"],
} satisfies Meta<typeof CommentThread>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockComments = [
	{
		id: "1",
		content: `Has anyone tried using this package with **Bun**? I'm getting some weird behavior with the ESM imports.

\`\`\`typescript
import { createClient } from "@package/core";
const client = createClient({ timeout: 5000 });
\`\`\`

Any ideas?`,
		createdAt: Date.now() - 2 * 60 * 60 * 1000,
		updatedAt: Date.now() - 2 * 60 * 60 * 1000,
		deletedAt: null,
		replyToId: null,
		author: { id: "user-1", name: "sarah_dev" },
		replies: [
			{
				id: "2",
				content: `I had the same issue! The fix is to add this to your \`bunfig.toml\`:

\`\`\`toml
[install]
peer = false
\`\`\`

Then reinstall. Worked for me.`,
				createdAt: Date.now() - 1 * 60 * 60 * 1000,
				updatedAt: Date.now() - 1 * 60 * 60 * 1000,
				deletedAt: null,
				replyToId: "1",
				author: { id: "user-2", name: "mike_js" },
			},
			{
				id: "3",
				content:
					"That worked! Thanks so much. Should we open an issue about this?",
				createdAt: Date.now() - 45 * 60 * 1000,
				updatedAt: Date.now() - 40 * 60 * 1000,
				deletedAt: null,
				replyToId: "1",
				author: { id: "user-1", name: "sarah_dev" },
			},
		],
	},
	{
		id: "4",
		content: "Great catch! I've added this to the docs in the latest release.",
		createdAt: Date.now() - 30 * 60 * 1000,
		updatedAt: Date.now() - 30 * 60 * 1000,
		deletedAt: null,
		replyToId: null,
		author: { id: "user-3", name: "alex_maintainer" },
		replies: [],
	},
];

const withCommentsBase: Story = {
	args: {
		comments: mockComments,
		currentUserId: "user-1",
		currentUserName: "sarah_dev",
		onCommentSubmit: (content: string, replyToId?: string) =>
			console.log("Submit:", { content, replyToId }),
		onCommentEdit: (id: string, content: string) =>
			console.log("Edit:", { id, content }),
		onCommentDelete: (id: string) => console.log("Delete:", id),
	},
};

const withCommentsThemed = createThemedStories({
	story: withCommentsBase,
	testMode: "both",
});

export const WithCommentsLight = withCommentsThemed.Light;
export const WithCommentsDark = withCommentsThemed.Dark;

const emptyBase: Story = {
	args: {
		comments: [],
		currentUserId: "user-1",
		currentUserName: "sarah_dev",
		onCommentSubmit: (content: string, replyToId?: string) =>
			console.log("Submit:", { content, replyToId }),
		onCommentEdit: (id: string, content: string) =>
			console.log("Edit:", { id, content }),
		onCommentDelete: (id: string) => console.log("Delete:", id),
	},
};

const emptyThemed = createThemedStories({
	story: emptyBase,
	testMode: "both",
});

export const EmptyLight = emptyThemed.Light;
export const EmptyDark = emptyThemed.Dark;

const notLoggedInBase: Story = {
	args: {
		comments: mockComments,
		currentUserId: undefined,
		currentUserName: undefined,
		onCommentSubmit: () => {},
		onCommentEdit: () => {},
		onCommentDelete: () => {},
	},
};

const notLoggedInThemed = createThemedStories({
	story: notLoggedInBase,
	testMode: "both",
});

export const NotLoggedInLight = notLoggedInThemed.Light;
export const NotLoggedInDark = notLoggedInThemed.Dark;

const withDeletedCommentBase: Story = {
	args: {
		comments: [
			{
				id: "1",
				content: "",
				createdAt: Date.now() - 3 * 60 * 60 * 1000,
				updatedAt: Date.now() - 3 * 60 * 60 * 1000,
				deletedAt: Date.now() - 2 * 60 * 60 * 1000,
				replyToId: null,
				author: { id: "user-deleted", name: "deleted_user" },
				replies: [
					{
						id: "2",
						content:
							"Replying to a deleted comment - the context is preserved.",
						createdAt: Date.now() - 1 * 60 * 60 * 1000,
						updatedAt: Date.now() - 1 * 60 * 60 * 1000,
						deletedAt: null,
						replyToId: "1",
						author: { id: "user-1", name: "sarah_dev" },
					},
				],
			},
		],
		currentUserId: "user-1",
		currentUserName: "sarah_dev",
		onCommentSubmit: () => {},
		onCommentEdit: () => {},
		onCommentDelete: () => {},
	},
};

const withDeletedCommentThemed = createThemedStories({
	story: withDeletedCommentBase,
	testMode: "both",
});

export const WithDeletedCommentLight = withDeletedCommentThemed.Light;
export const WithDeletedCommentDark = withDeletedCommentThemed.Dark;

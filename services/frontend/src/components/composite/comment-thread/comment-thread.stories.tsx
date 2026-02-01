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
		rootCommentId: null,
		author: { id: "user-1", name: "sarah_dev" },
		hasReplies: true,
	},
	{
		id: "4",
		content: "Great package! Works perfectly for my use case.",
		createdAt: Date.now() - 30 * 60 * 1000,
		updatedAt: Date.now() - 30 * 60 * 1000,
		deletedAt: null,
		replyToId: null,
		rootCommentId: null,
		author: { id: "user-3", name: "alex_maintainer" },
		hasReplies: false,
	},
];

const noop = () => {};
const emptyRepliesData = () => ({ replies: [], hasMore: false });

const withCommentsBase: Story = {
	args: {
		comments: mockComments,
		currentUserId: "user-1",
		currentUserName: "sarah_dev",
		onCommentSubmit: (
			content: string,
			replyToId?: string,
			rootCommentId?: string,
		) => console.log("Submit:", { content, replyToId, rootCommentId }),
		onCommentEdit: (id: string, content: string) =>
			console.log("Edit:", { id, content }),
		onCommentDelete: (id: string) => console.log("Delete:", id),
		showReplies: (id: string) => console.log("Show replies:", id),
		loadMoreReplies: (id: string) => console.log("Load more:", id),
		hideReplies: (id: string) => console.log("Hide:", id),
		isShowingReplies: () => false,
		getRepliesData: emptyRepliesData,
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
		onCommentSubmit: noop,
		onCommentEdit: noop,
		onCommentDelete: noop,
		showReplies: noop,
		loadMoreReplies: noop,
		hideReplies: noop,
		isShowingReplies: () => false,
		getRepliesData: emptyRepliesData,
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
		onCommentSubmit: noop,
		onCommentEdit: noop,
		onCommentDelete: noop,
		showReplies: noop,
		loadMoreReplies: noop,
		hideReplies: noop,
		isShowingReplies: () => false,
		getRepliesData: emptyRepliesData,
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
				rootCommentId: null,
				author: { id: "user-deleted", name: "deleted_user" },
				hasReplies: true,
			},
		],
		currentUserId: "user-1",
		currentUserName: "sarah_dev",
		onCommentSubmit: noop,
		onCommentEdit: noop,
		onCommentDelete: noop,
		showReplies: noop,
		loadMoreReplies: noop,
		hideReplies: noop,
		isShowingReplies: () => false,
		getRepliesData: emptyRepliesData,
	},
};

const withDeletedCommentThemed = createThemedStories({
	story: withDeletedCommentBase,
	testMode: "both",
});

export const WithDeletedCommentLight = withDeletedCommentThemed.Light;
export const WithDeletedCommentDark = withDeletedCommentThemed.Dark;

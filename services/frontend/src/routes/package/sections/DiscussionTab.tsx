import { queries, useQuery } from "@package/database/client";
import { createEffect, createMemo, Show } from "solid-js";
import { CommentThread } from "@/components/composite/comment-thread";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Spinner } from "@/components/ui/spinner";
import {
	type RootComment,
	useCommentThread,
	useReplies,
} from "@/hooks/useCommentThread";
import { useLinkedComment } from "@/hooks/useLinkedComment";
import { MAX_REPLIES_PER_THREAD } from "@/lib/constants";

interface DiscussionTabProps {
	packageId: string;
}

export const DiscussionTab = (props: DiscussionTabProps) => {
	const thread = useCommentThread(() => ({
		entityType: "package",
		entityId: props.packageId,
	}));
	const linkedComment = useLinkedComment();

	// Fetch the linked comment by ID to determine its root
	const [linkedCommentData] = useQuery(() => {
		const id = linkedComment.linkedCommentId();
		return id ? queries.comments.byId({ id }) : null;
	});

	// Get the root comment ID (either the comment itself if root, or its rootCommentId)
	const linkedRootId = createMemo(() => {
		const data = linkedCommentData();
		if (!data) return null;
		return data.rootCommentId ?? data.id;
	});

	// Fetch the root comment separately (this ensures we always have it)
	const [linkedRootData] = useQuery(() => {
		const rootId = linkedRootId();
		return rootId ? queries.comments.byId({ id: rootId }) : null;
	});

	// Transform the fetched root to match RootComment type
	const linkedRootComment = createMemo((): RootComment | null => {
		const data = linkedRootData();
		if (!data) return null;
		return {
			id: data.id,
			content: data.content,
			createdAt: data.createdAt,
			updatedAt: data.updatedAt,
			deletedAt: data.deletedAt,
			replyToId: data.replyToId,
			rootCommentId: data.rootCommentId,
			author: data.author,
			hasReplies: (data.replies?.length ?? 0) > 0,
		};
	});

	// Combine: linked root first (if exists), then filter it from normal results
	const orderedComments = createMemo(() => {
		const all = thread.comments();
		const linked = linkedRootComment();

		if (!linked) return all;

		// Filter out the linked root from normal results to avoid duplicate
		const filtered = all.filter((c) => c.id !== linked.id);
		return [linked, ...filtered];
	});

	// Auto-expand replies for the linked root comment
	createEffect(() => {
		const rootId = linkedRootId();
		if (!rootId || thread.isLoading()) return;

		if (!thread.isShowingReplies(rootId)) {
			thread.showReplies(rootId);
		}
	});

	// Scroll when the highlighted comment mounts
	const handleHighlightedCommentMounted = () => {
		const commentId = linkedComment.linkedCommentId();
		if (commentId) {
			linkedComment.scrollToComment(commentId);
		}
	};

	// Create a replies fetcher for each root comment
	const getRepliesData = (rootCommentId: string) => {
		const { replies } = useReplies(() =>
			thread.isShowingReplies(rootCommentId) ? rootCommentId : undefined,
		);
		const replyList = replies();
		return {
			replies: replyList,
			isAtMax: replyList.length >= MAX_REPLIES_PER_THREAD,
		};
	};

	return (
		<Show
			when={!thread.isLoading()}
			fallback={
				<Stack spacing="md" align="center" class="py-8">
					<Spinner size="md" />
					<Text color="muted" size="sm">
						Loading discussion...
					</Text>
				</Stack>
			}
		>
			<CommentThread
				comments={orderedComments()}
				currentUserId={thread.currentUserId()}
				currentUserName={thread.currentUserName()}
				onCommentSubmit={thread.onSubmit}
				onCommentEdit={thread.onEdit}
				onCommentDelete={thread.onDelete}
				showReplies={thread.showReplies}
				hideReplies={thread.hideReplies}
				isShowingReplies={thread.isShowingReplies}
				getRepliesData={getRepliesData}
				highlightedCommentId={linkedComment.linkedCommentId()}
				onHighlightedCommentMounted={handleHighlightedCommentMounted}
			/>
		</Show>
	);
};

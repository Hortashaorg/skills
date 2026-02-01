import { Show } from "solid-js";
import { CommentThread } from "@/components/composite/comment-thread";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Spinner } from "@/components/ui/spinner";
import { useCommentThread, useReplies } from "@/hooks/useCommentThread";

interface DiscussionTabProps {
	packageId: string;
}

export const DiscussionTab = (props: DiscussionTabProps) => {
	const thread = useCommentThread(() => ({
		entityType: "package",
		entityId: props.packageId,
	}));

	// Create a replies fetcher for each root comment
	const getRepliesData = (rootCommentId: string) => {
		const { replies, hasMore } = useReplies(
			() =>
				thread.isShowingReplies(rootCommentId) ? rootCommentId : undefined,
			() => thread.getReplyLimit(rootCommentId),
		);
		return { replies: replies(), hasMore: hasMore() };
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
				comments={thread.comments()}
				currentUserId={thread.currentUserId()}
				currentUserName={thread.currentUserName()}
				onCommentSubmit={thread.onSubmit}
				onCommentEdit={thread.onEdit}
				onCommentDelete={thread.onDelete}
				showReplies={thread.showReplies}
				loadMoreReplies={thread.loadMoreReplies}
				hideReplies={thread.hideReplies}
				isShowingReplies={thread.isShowingReplies}
				getRepliesData={getRepliesData}
			/>
		</Show>
	);
};

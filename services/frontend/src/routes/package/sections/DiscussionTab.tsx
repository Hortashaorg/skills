import { Show } from "solid-js";
import { CommentThread } from "@/components/composite/comment-thread";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Spinner } from "@/components/ui/spinner";
import { useCommentThread } from "@/hooks/useCommentThread";

interface DiscussionTabProps {
	packageId: string;
}

export const DiscussionTab = (props: DiscussionTabProps) => {
	const thread = useCommentThread(() => ({
		entityType: "package",
		entityId: props.packageId,
	}));

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
			/>
		</Show>
	);
};

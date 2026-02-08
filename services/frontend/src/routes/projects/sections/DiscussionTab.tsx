import { queries, useQuery } from "@package/database/client";
import { createEffect, createMemo, createSignal, Show } from "solid-js";
import { CommentThread } from "@/components/composite/comment-thread";
import type { EntitySearch } from "@/components/composite/markdown-editor";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { extractEntityIdsFromMultiple } from "@/components/ui/markdown-output";
import { Spinner } from "@/components/ui/spinner";
import { useEcosystemByIds } from "@/hooks/ecosystems/useEcosystemByIds";
import { usePackageByIds } from "@/hooks/packages/usePackageByIds";
import { useProjectByIds } from "@/hooks/projects/useProjectByIds";
import {
	type RootComment,
	useCommentThread,
	useReplies,
} from "@/hooks/useCommentThread";
import { useLinkedComment } from "@/hooks/useLinkedComment";
import { useUserByIds } from "@/hooks/users/useUserByIds";
import { MAX_REPLIES_PER_THREAD } from "@/lib/constants";

interface DiscussionTabProps {
	projectId: string;
	search: EntitySearch;
}

export const DiscussionTab = (props: DiscussionTabProps) => {
	const thread = useCommentThread(() => ({
		entityType: "project",
		entityId: props.projectId,
	}));
	const linkedComment = useLinkedComment();

	const [linkedCommentData] = useQuery(() => {
		const id = linkedComment.linkedCommentId();
		return id ? queries.comments.byId({ id }) : null;
	});

	const linkedRootId = createMemo(() => {
		const data = linkedCommentData();
		if (!data) return null;
		return data.rootCommentId ?? data.id;
	});

	const [linkedRootData] = useQuery(() => {
		const rootId = linkedRootId();
		return rootId ? queries.comments.byId({ id: rootId }) : null;
	});

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

	const orderedComments = createMemo(() => {
		const all = thread.comments();
		const linked = linkedRootComment();

		if (!linked) return all;

		const filtered = all.filter((c) => c.id !== linked.id);
		return [linked, ...filtered];
	});

	const [editorContent, setEditorContent] = createSignal("");

	const [allThreadComments] = useQuery(() => {
		const threadId = thread.threadId();
		return threadId ? queries.comments.allByThreadId({ threadId }) : null;
	});

	const extractedIds = createMemo(() => {
		const comments = allThreadComments() ?? [];
		const contents = comments.map((c) => c.content);
		const editor = editorContent();
		if (editor) {
			contents.push(editor);
		}
		return extractEntityIdsFromMultiple(contents);
	});

	const { packages: packagesByIds } = usePackageByIds(
		() => extractedIds().packages,
	);
	const { ecosystems: ecosystemsByIds } = useEcosystemByIds(
		() => extractedIds().ecosystems,
	);
	const { projects: projectsByIds } = useProjectByIds(
		() => extractedIds().projects,
	);
	const { users: usersByIds } = useUserByIds(() => extractedIds().users);

	const entityByIds = {
		packages: packagesByIds,
		ecosystems: ecosystemsByIds,
		projects: projectsByIds,
		users: usersByIds,
	};

	createEffect(() => {
		const rootId = linkedRootId();
		if (!rootId || thread.isLoading()) return;

		if (!thread.isShowingReplies(rootId)) {
			thread.showReplies(rootId);
		}
	});

	const handleHighlightedCommentMounted = () => {
		const commentId = linkedComment.linkedCommentId();
		if (commentId) {
			linkedComment.scrollToComment(commentId);
		}
	};

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
				onEditorContentChange={setEditorContent}
				search={props.search}
				byIds={entityByIds}
			/>
		</Show>
	);
};

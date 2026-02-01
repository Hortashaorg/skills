import { createSignal, For, type JSX, Show, splitProps } from "solid-js";
import { CommentCard } from "@/components/composite/comment-card";
import { MarkdownEditor } from "@/components/composite/markdown-editor";
import { Stack } from "@/components/primitives/stack";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { BaseComment, Reply, RootComment } from "@/hooks/useCommentThread";
import { cn } from "@/lib/utils";

interface ReplyTarget {
	rootCommentId: string;
	replyToId: string;
	replyToAuthorName: string | null;
}

export type CommentThreadProps = Omit<
	JSX.IntrinsicElements["div"],
	"children"
> & {
	comments: readonly RootComment[];
	currentUserId?: string;
	currentUserName?: string;
	onCommentSubmit: (
		content: string,
		replyToId?: string,
		rootCommentId?: string,
	) => void;
	onCommentEdit: (commentId: string, content: string) => void;
	onCommentDelete: (commentId: string) => void;
	// Replies management
	showReplies: (rootCommentId: string) => void;
	loadMoreReplies: (rootCommentId: string) => void;
	hideReplies: (rootCommentId: string) => void;
	isShowingReplies: (rootCommentId: string) => boolean;
	// For fetching replies data
	getRepliesData: (rootCommentId: string) => {
		replies: readonly Reply[];
		hasMore: boolean;
	};
};

function formatRelativeTime(timestamp: number): string {
	const now = Date.now();
	const diff = now - timestamp;
	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (days > 0) return `${days}d ago`;
	if (hours > 0) return `${hours}h ago`;
	if (minutes > 0) return `${minutes}m ago`;
	return "just now";
}

function getInitials(name: string | null | undefined): string {
	if (!name) return "?";
	return name.charAt(0).toUpperCase();
}

export const CommentThread = (props: CommentThreadProps) => {
	const [local, others] = splitProps(props, [
		"comments",
		"currentUserId",
		"currentUserName",
		"onCommentSubmit",
		"onCommentEdit",
		"onCommentDelete",
		"showReplies",
		"loadMoreReplies",
		"hideReplies",
		"isShowingReplies",
		"getRepliesData",
		"class",
	]);

	// State
	const [editingId, setEditingId] = createSignal<string | null>(null);
	const [replyTarget, setReplyTarget] = createSignal<ReplyTarget | null>(null);
	const [newComment, setNewComment] = createSignal("");
	const [editContent, setEditContent] = createSignal("");
	const [replyContent, setReplyContent] = createSignal("");

	// Handlers
	const handleNewCommentSubmit = () => {
		if (!newComment().trim()) return;
		local.onCommentSubmit(newComment());
		setNewComment("");
	};

	const startEdit = (comment: BaseComment) => {
		setEditingId(comment.id);
		setEditContent(comment.content);
		setReplyTarget(null);
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditContent("");
	};

	const saveEdit = () => {
		const id = editingId();
		if (!id || !editContent().trim()) return;
		local.onCommentEdit(id, editContent());
		setEditingId(null);
		setEditContent("");
	};

	const startReply = (
		rootCommentId: string,
		replyToId: string,
		replyToAuthorName: string | null,
	) => {
		setReplyTarget({ rootCommentId, replyToId, replyToAuthorName });
		setReplyContent("");
		setEditingId(null);
		// Show replies when starting to reply
		local.showReplies(rootCommentId);
	};

	const cancelReply = () => {
		setReplyTarget(null);
		setReplyContent("");
	};

	const submitReply = () => {
		const target = replyTarget();
		if (!target || !replyContent().trim()) return;
		local.onCommentSubmit(
			replyContent(),
			target.replyToId,
			target.rootCommentId,
		);
		setReplyTarget(null);
		setReplyContent("");
	};

	// Render a single comment card with edit mode support
	const SingleComment = (itemProps: {
		comment: BaseComment;
		rootCommentId: string;
		isRoot: boolean;
		replyToAuthorName?: string;
	}) => {
		const isEditing = () => editingId() === itemProps.comment.id;
		const isDeleted = () => itemProps.comment.deletedAt !== null;
		const isOwnComment = () =>
			local.currentUserId &&
			itemProps.comment.author?.id === local.currentUserId;

		return (
			<div class="flex gap-3">
				<div class="hidden sm:block">
					<Avatar
						initials={getInitials(itemProps.comment.author?.name)}
						size={itemProps.isRoot ? "md" : "sm"}
						variant={
							isOwnComment() ? "secondary" : isDeleted() ? "muted" : "primary"
						}
					/>
				</div>

				<div class="flex-1 min-w-0">
					<Show
						when={!isEditing()}
						fallback={
							<MarkdownEditor
								value={editContent()}
								onInput={setEditContent}
								onSubmit={saveEdit}
								onCancel={cancelEdit}
								submitLabel="Save"
								placeholder="Edit your comment..."
							/>
						}
					>
						<CommentCard
							author={itemProps.comment.author?.name ?? "Unknown"}
							timestamp={formatRelativeTime(itemProps.comment.createdAt)}
							content={itemProps.comment.content}
							replyToAuthor={itemProps.replyToAuthorName}
							editedAt={
								!isDeleted() &&
								itemProps.comment.updatedAt > itemProps.comment.createdAt
									? formatRelativeTime(itemProps.comment.updatedAt)
									: undefined
							}
							isDeleted={isDeleted()}
							onEdit={
								isOwnComment() && !isDeleted()
									? () => startEdit(itemProps.comment)
									: undefined
							}
							onDelete={
								isOwnComment() && !isDeleted()
									? () => local.onCommentDelete(itemProps.comment.id)
									: undefined
							}
							onReply={
								!isDeleted() && local.currentUserId
									? () =>
											startReply(
												itemProps.rootCommentId,
												itemProps.comment.id,
												itemProps.comment.author?.name ?? null,
											)
									: undefined
							}
						/>
					</Show>
				</div>
			</div>
		);
	};

	// Render a root comment with its replies
	const RootCommentItem = (itemProps: { comment: RootComment }) => {
		const isReplyingToThisThread = () =>
			replyTarget()?.rootCommentId === itemProps.comment.id;
		const showingReplies = () => local.isShowingReplies(itemProps.comment.id);
		const repliesData = () => local.getRepliesData(itemProps.comment.id);

		return (
			<div>
				<SingleComment
					comment={itemProps.comment}
					rootCommentId={itemProps.comment.id}
					isRoot={true}
				/>

				{/* Show replies button - when has replies but not showing */}
				<Show
					when={
						itemProps.comment.hasReplies &&
						!showingReplies() &&
						!isReplyingToThisThread()
					}
				>
					<div class="mt-2 sm:ml-12">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => local.showReplies(itemProps.comment.id)}
						>
							Show replies
						</Button>
					</div>
				</Show>

				{/* Replies section - when showing */}
				<Show when={showingReplies() || isReplyingToThisThread()}>
					<div class="mt-4 pl-4 sm:pl-0 sm:ml-12 space-y-3 border-l-2 sm:border-l-0 border-outline/30 dark:border-outline-dark/30">
						{/* Replies list */}
						<For each={repliesData().replies}>
							{(reply) => (
								<SingleComment
									comment={reply}
									rootCommentId={itemProps.comment.id}
									isRoot={false}
									replyToAuthorName={reply.replyTo?.author?.name ?? undefined}
								/>
							)}
						</For>

						{/* Load more / Collapse buttons */}
						<Show when={showingReplies()}>
							<div class="flex gap-2">
								<Show when={repliesData().hasMore}>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => local.loadMoreReplies(itemProps.comment.id)}
									>
										Show more replies
									</Button>
								</Show>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => local.hideReplies(itemProps.comment.id)}
								>
									Collapse
								</Button>
							</div>
						</Show>

						{/* Inline reply editor */}
						<Show when={isReplyingToThisThread() && local.currentUserId}>
							<div
								class="flex gap-3"
								ref={(el) => {
									el.scrollIntoView({
										behavior: "smooth",
										block: "center",
									});
								}}
							>
								<div class="hidden sm:block">
									<Avatar
										initials={getInitials(local.currentUserName)}
										size="sm"
										variant="secondary"
									/>
								</div>
								<div class="flex-1 min-w-0">
									<Show when={replyTarget()?.replyToAuthorName}>
										<p class="text-xs text-on-surface-muted dark:text-on-surface-dark-muted mb-2">
											Replying to @{replyTarget()?.replyToAuthorName}
										</p>
									</Show>
									<MarkdownEditor
										value={replyContent()}
										onInput={setReplyContent}
										onSubmit={submitReply}
										onCancel={cancelReply}
										submitLabel="Reply"
										placeholder="Write a reply..."
									/>
								</div>
							</div>
						</Show>
					</div>
				</Show>
			</div>
		);
	};

	return (
		<div class={cn("space-y-6", local.class)} {...others}>
			{/* New comment input */}
			<Show when={local.currentUserId}>
				<div class="flex gap-3">
					<div class="hidden sm:block">
						<Avatar
							initials={getInitials(local.currentUserName)}
							size="md"
							variant="secondary"
						/>
					</div>
					<div class="flex-1 min-w-0">
						<MarkdownEditor
							value={newComment()}
							onInput={setNewComment}
							onSubmit={handleNewCommentSubmit}
							submitLabel="Comment"
							placeholder="Write a comment..."
						/>
					</div>
				</div>
			</Show>

			{/* Comments list */}
			<Show
				when={local.comments.length > 0}
				fallback={
					<p class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted text-center py-8">
						No comments yet. Be the first to comment!
					</p>
				}
			>
				<Stack spacing="lg">
					<For each={local.comments}>
						{(comment) => <RootCommentItem comment={comment} />}
					</For>
				</Stack>
			</Show>
		</div>
	);
};

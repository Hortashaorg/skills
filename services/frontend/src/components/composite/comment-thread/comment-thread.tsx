import { A } from "@solidjs/router";
import { createSignal, For, type JSX, Show, splitProps } from "solid-js";
import { CommentCard } from "@/components/composite/comment-card";
import { MarkdownEditor } from "@/components/composite/markdown-editor";
import { Stack } from "@/components/primitives/stack";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { BaseComment, Reply, RootComment } from "@/hooks/useCommentThread";
import { MAX_COMMENT_LENGTH } from "@/lib/constants";
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
	hideReplies: (rootCommentId: string) => void;
	isShowingReplies: (rootCommentId: string) => boolean;
	// For fetching replies data
	getRepliesData: (rootCommentId: string) => {
		replies: readonly Reply[];
		isAtMax: boolean;
	};
	// Linked comment highlighting and scrolling
	highlightedCommentId?: string | null;
	onHighlightedCommentMounted?: () => void;
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
		"hideReplies",
		"isShowingReplies",
		"getRepliesData",
		"highlightedCommentId",
		"onHighlightedCommentMounted",
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
		replyToAuthorId?: string;
		isAtMax?: boolean;
	}) => {
		const isEditing = () => editingId() === itemProps.comment.id;
		const isDeleted = () => itemProps.comment.deletedAt !== null;
		const isOwnComment = () =>
			local.currentUserId &&
			itemProps.comment.author?.id === local.currentUserId;
		const isHighlighted = () =>
			local.highlightedCommentId === itemProps.comment.id;

		const handleRef = (_el: HTMLDivElement) => {
			if (isHighlighted() && local.onHighlightedCommentMounted) {
				local.onHighlightedCommentMounted();
			}
		};

		return (
			<div
				ref={handleRef}
				id={`comment-${itemProps.comment.id}`}
				class="flex gap-3"
			>
				<div class="hidden sm:block">
					<Show
						when={itemProps.comment.author?.id}
						fallback={
							<Avatar
								initials={getInitials(itemProps.comment.author?.name)}
								size={itemProps.isRoot ? "md" : "sm"}
								variant={
									isOwnComment()
										? "secondary"
										: isDeleted()
											? "muted"
											: "primary"
								}
							/>
						}
					>
						{(authorId) => (
							<A href={`/user/${authorId()}`}>
								<Avatar
									initials={getInitials(itemProps.comment.author?.name)}
									size={itemProps.isRoot ? "md" : "sm"}
									variant={
										isOwnComment()
											? "secondary"
											: isDeleted()
												? "muted"
												: "primary"
									}
								/>
							</A>
						)}
					</Show>
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
								maxLength={MAX_COMMENT_LENGTH}
							/>
						}
					>
						<CommentCard
							author={itemProps.comment.author?.name ?? "Unknown"}
							authorId={itemProps.comment.author?.id}
							timestamp={formatRelativeTime(itemProps.comment.createdAt)}
							content={itemProps.comment.content}
							replyToAuthor={itemProps.replyToAuthorName}
							replyToAuthorId={itemProps.replyToAuthorId}
							editedAt={
								!isDeleted() &&
								itemProps.comment.updatedAt > itemProps.comment.createdAt
									? formatRelativeTime(itemProps.comment.updatedAt)
									: undefined
							}
							isDeleted={isDeleted()}
							isHighlighted={isHighlighted()}
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
								!isDeleted() && local.currentUserId && !itemProps.isAtMax
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
					isAtMax={repliesData().isAtMax}
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
									replyToAuthorId={reply.replyTo?.author?.id}
									isAtMax={repliesData().isAtMax}
								/>
							)}
						</For>

						{/* Max replies message */}
						<Show when={repliesData().isAtMax}>
							<p class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted italic">
								Maximum replies reached (100). No more replies can be added to
								this thread.
							</p>
						</Show>

						{/* Collapse button */}
						<Show when={showingReplies()}>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => local.hideReplies(itemProps.comment.id)}
							>
								Collapse
							</Button>
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
										maxLength={MAX_COMMENT_LENGTH}
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
							maxLength={MAX_COMMENT_LENGTH}
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

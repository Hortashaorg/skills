import { createSignal, For, type JSX, Show, splitProps } from "solid-js";
import { CommentCard } from "@/components/composite/comment-card";
import { MarkdownEditor } from "@/components/composite/markdown-editor";
import { Stack } from "@/components/primitives/stack";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Author {
	id: string;
	name: string | null;
}

interface Reply {
	id: string;
	content: string;
	createdAt: number;
	updatedAt: number;
	deletedAt: number | null;
	replyToId: string | null;
	author: Author | undefined;
}

interface Comment {
	id: string;
	content: string;
	createdAt: number;
	updatedAt: number;
	deletedAt: number | null;
	replyToId: string | null;
	author: Author | undefined;
	replies?: readonly Reply[];
}

export type CommentThreadProps = Omit<
	JSX.IntrinsicElements["div"],
	"children"
> & {
	comments: readonly Comment[];
	currentUserId?: string;
	currentUserName?: string;
	onCommentSubmit: (content: string, replyToId?: string) => void;
	onCommentEdit: (commentId: string, content: string) => void;
	onCommentDelete: (commentId: string) => void;
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
		"class",
	]);

	// State
	const [editingId, setEditingId] = createSignal<string | null>(null);
	const [replyingToId, setReplyingToId] = createSignal<string | null>(null);
	const [newComment, setNewComment] = createSignal("");
	const [editContent, setEditContent] = createSignal("");
	const [replyContent, setReplyContent] = createSignal("");

	// Handlers
	const handleNewCommentSubmit = () => {
		if (!newComment().trim()) return;
		local.onCommentSubmit(newComment());
		setNewComment("");
	};

	const startEdit = (comment: Comment | Reply) => {
		setEditingId(comment.id);
		setEditContent(comment.content);
		setReplyingToId(null);
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

	const startReply = (commentId: string) => {
		setReplyingToId(commentId);
		setReplyContent("");
		setEditingId(null);
	};

	const cancelReply = () => {
		setReplyingToId(null);
		setReplyContent("");
	};

	const submitReply = () => {
		const parentId = replyingToId();
		if (!parentId || !replyContent().trim()) return;
		local.onCommentSubmit(replyContent(), parentId);
		setReplyingToId(null);
		setReplyContent("");
	};

	// Render a single comment (used for both top-level and replies)
	const CommentItem = (itemProps: {
		comment: Comment | Reply;
		depth: number;
		parentAuthorName?: string;
	}) => {
		const isEditing = () => editingId() === itemProps.comment.id;
		const isDeleted = () => itemProps.comment.deletedAt !== null;
		const isOwnComment = () =>
			local.currentUserId &&
			itemProps.comment.author?.id === local.currentUserId;
		const avatarSize = () =>
			(itemProps.depth === 0 ? "md" : "sm") as "md" | "sm";

		const replies = () =>
			"replies" in itemProps.comment ? itemProps.comment.replies : undefined;
		const isReplyingToThis = () => replyingToId() === itemProps.comment.id;

		return (
			<div class="flex gap-3">
				<Avatar
					initials={getInitials(itemProps.comment.author?.name)}
					size={avatarSize()}
					variant={
						isOwnComment() ? "secondary" : isDeleted() ? "muted" : "primary"
					}
				/>

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
							replyToAuthor={itemProps.parentAuthorName}
							editedAt={
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
									? () => startReply(itemProps.comment.id)
									: undefined
							}
						/>
					</Show>

					{/* Nested replies */}
					<Show when={(replies()?.length ?? 0) > 0 || isReplyingToThis()}>
						<div class="mt-3 pl-4 border-l-2 border-outline/30 dark:border-outline-dark/30">
							<Stack spacing="md">
								<For each={replies()}>
									{(reply) => (
										<CommentItem
											comment={reply}
											depth={itemProps.depth + 1}
											parentAuthorName={
												itemProps.comment.author?.name ?? undefined
											}
										/>
									)}
								</For>

								{/* Inline reply editor */}
								<Show when={isReplyingToThis() && local.currentUserId}>
									<div
										class="flex gap-3"
										ref={(el) => {
											el.scrollIntoView({
												behavior: "smooth",
												block: "center",
											});
										}}
									>
										<Avatar
											initials={getInitials(local.currentUserName)}
											size="sm"
											variant="secondary"
										/>
										<div class="flex-1 min-w-0">
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
							</Stack>
						</div>
					</Show>
				</div>
			</div>
		);
	};

	return (
		<div class={cn("space-y-6", local.class)} {...others}>
			{/* New comment input */}
			<Show when={local.currentUserId}>
				<div class="flex gap-3">
					<Avatar
						initials={getInitials(local.currentUserName)}
						size="md"
						variant="secondary"
					/>
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
						{(comment) => <CommentItem comment={comment} depth={0} />}
					</For>
				</Stack>
			</Show>
		</div>
	);
};

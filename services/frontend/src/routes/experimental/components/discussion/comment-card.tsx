import { createSignal, For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { MarkdownField, MarkdownOutput } from "../markdown";
import type { Comment } from "./types";

type CommentCardProps = {
	comment: Comment;
	currentUser?: string;
	onReply?: (comment: Comment) => void;
	onEdit?: (comment: Comment, newContent: string) => void;
	isReply?: boolean;
	replyingToId?: string | null;
	replyContent?: string;
	onReplyInput?: (value: string) => void;
	onReplySubmit?: () => void;
	onReplyCancel?: () => void;
};

export const CommentCard = (props: CommentCardProps) => {
	const [isEditing, setIsEditing] = createSignal(false);
	const [editContent, setEditContent] = createSignal(props.comment.content);

	const isOwnComment = () =>
		props.currentUser && props.comment.author === props.currentUser;
	const isReplyingToThis = () => props.replyingToId === props.comment.id;

	const handleSaveEdit = () => {
		props.onEdit?.(props.comment, editContent());
		setIsEditing(false);
	};

	const handleCancelEdit = () => {
		setEditContent(props.comment.content);
		setIsEditing(false);
	};

	return (
		<div class="flex gap-3">
			{/* Avatar */}
			<div
				class={`shrink-0 rounded-full bg-primary/20 dark:bg-primary-dark/20 flex items-center justify-center font-medium text-primary dark:text-primary-dark ${
					props.isReply ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"
				}`}
			>
				{props.comment.avatar}
			</div>

			{/* Comment body */}
			<div class="flex-1 min-w-0">
				<div class="rounded-lg border border-outline dark:border-outline-dark overflow-hidden">
					{/* Header */}
					<div class="px-4 py-2 bg-surface-alt/50 dark:bg-surface-dark-alt/50 border-b border-outline dark:border-outline-dark">
						<Flex gap="sm" align="center" justify="between">
							<Flex gap="sm" align="center">
								<span class="font-medium text-sm text-on-surface dark:text-on-surface-dark">
									{props.comment.author}
								</span>
								<Show when={props.comment.replyToAuthor}>
									{(author) => (
										<span class="text-xs text-on-surface/50 dark:text-on-surface-dark/50 flex items-center gap-1">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="12"
												height="12"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
												aria-hidden="true"
											>
												<polyline points="9 17 4 12 9 7" />
												<path d="M20 18v-2a4 4 0 0 0-4-4H4" />
											</svg>
											<span class="font-medium text-on-surface/70 dark:text-on-surface-dark/70">
												{author()}
											</span>
										</span>
									)}
								</Show>
								<span class="text-xs text-on-surface/50 dark:text-on-surface-dark/50">
									{props.comment.timestamp}
								</span>
								<Show when={props.comment.editedAt}>
									{(editedAt) => (
										<span
											class="text-xs text-on-surface/40 dark:text-on-surface-dark/40 italic"
											title={`Edited ${editedAt()}`}
										>
											(edited)
										</span>
									)}
								</Show>
							</Flex>
							<Flex gap="sm" align="center">
								<Show when={isOwnComment() && !isEditing()}>
									<button
										type="button"
										onClick={() => setIsEditing(true)}
										class="text-xs text-on-surface/50 dark:text-on-surface-dark/50 hover:text-primary dark:hover:text-primary-dark transition-colors"
									>
										Edit
									</button>
								</Show>
								<Show when={props.onReply && !isEditing()}>
									<button
										type="button"
										onClick={() => props.onReply?.(props.comment)}
										class="text-xs text-on-surface/50 dark:text-on-surface-dark/50 hover:text-primary dark:hover:text-primary-dark transition-colors"
									>
										Reply
									</button>
								</Show>
							</Flex>
						</Flex>
					</div>

					{/* Content - show editor when editing, otherwise show rendered content */}
					<Show
						when={!isEditing()}
						fallback={
							<MarkdownField
								value={editContent()}
								onInput={setEditContent}
								onSubmit={handleSaveEdit}
								onCancel={handleCancelEdit}
								submitLabel="Save"
							/>
						}
					>
						<div class="p-4 bg-surface dark:bg-surface-dark">
							<MarkdownOutput markdown={props.comment.content} />
						</div>
					</Show>
				</div>

				{/* Nested replies */}
				<Show
					when={
						(props.comment.replies && props.comment.replies.length > 0) ||
						isReplyingToThis()
					}
				>
					<div class="mt-3 pl-4">
						<Stack spacing="sm">
							<For each={props.comment.replies}>
								{(reply) => (
									<CommentCard
										comment={reply}
										currentUser={props.currentUser}
										onReply={props.onReply}
										onEdit={props.onEdit}
										isReply
										replyingToId={props.replyingToId}
										replyContent={props.replyContent}
										onReplyInput={props.onReplyInput}
										onReplySubmit={props.onReplySubmit}
										onReplyCancel={props.onReplyCancel}
									/>
								)}
							</For>

							{/* Inline reply editor at bottom of this thread */}
							<Show when={isReplyingToThis() && props.currentUser}>
								<div
									ref={(el) => {
										el.scrollIntoView({ behavior: "smooth", block: "center" });
									}}
									class="flex gap-3"
								>
									<div class="shrink-0 w-8 h-8 rounded-full bg-secondary/20 dark:bg-secondary-dark/20 flex items-center justify-center text-xs font-medium text-secondary dark:text-secondary-dark">
										{props.currentUser?.charAt(0).toUpperCase()}
									</div>
									<div class="flex-1">
										<MarkdownField
											value={props.replyContent ?? ""}
											onInput={(v) => props.onReplyInput?.(v)}
											onSubmit={props.onReplySubmit}
											onCancel={props.onReplyCancel}
											submitLabel="Reply"
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

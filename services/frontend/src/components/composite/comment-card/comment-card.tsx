import { A } from "@solidjs/router";
import { type JSX, Show, splitProps } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { MarkdownOutput } from "@/components/ui/markdown-output";
import { cn } from "@/lib/utils";

export type CommentCardProps = Omit<
	JSX.IntrinsicElements["div"],
	"children"
> & {
	/** Author display name */
	author: string;
	/** Author ID for profile link */
	authorId?: string;
	/** Timestamp display string */
	timestamp: string;
	/** Markdown content of the comment */
	content: string;
	/** If replying to someone, show their name */
	replyToAuthor?: string;
	/** Reply-to author ID for profile link */
	replyToAuthorId?: string;
	/** Show edited indicator */
	editedAt?: string;
	/** Whether the comment is deleted (show placeholder) */
	isDeleted?: boolean;
	/** Whether this comment is highlighted (linked from URL) */
	isHighlighted?: boolean;
	/** Called when reply button clicked */
	onReply?: () => void;
	/** Called when edit button clicked */
	onEdit?: () => void;
	/** Called when delete button clicked */
	onDelete?: () => void;
};

export const CommentCard = (props: CommentCardProps) => {
	const [local, others] = splitProps(props, [
		"author",
		"authorId",
		"timestamp",
		"content",
		"replyToAuthor",
		"replyToAuthorId",
		"editedAt",
		"isDeleted",
		"isHighlighted",
		"onReply",
		"onEdit",
		"onDelete",
		"class",
	]);

	return (
		<div
			class={cn(
				"rounded-radius border border-outline dark:border-outline-dark overflow-hidden",
				local.class,
			)}
			{...others}
		>
			{/* Header */}
			<div
				class={cn(
					"px-4 py-2 border-b border-outline dark:border-outline-dark",
					local.isHighlighted
						? "bg-success/20 dark:bg-success-dark/20"
						: "bg-surface-alt/50 dark:bg-surface-dark-alt/50",
				)}
			>
				<Flex gap="sm" align="center" justify="between">
					<Flex gap="sm" align="center" class="flex-wrap">
						<Show
							when={local.authorId}
							fallback={
								<span class="font-medium text-sm text-on-surface dark:text-on-surface-dark">
									{local.author}
								</span>
							}
						>
							<A
								href={`/user/${local.authorId}`}
								class="font-medium text-sm text-on-surface dark:text-on-surface-dark hover:text-brand dark:hover:text-brand-dark transition-colors"
							>
								{local.author}
							</A>
						</Show>
						<Show when={local.replyToAuthor}>
							{(author) => (
								<span class="text-xs text-on-surface-muted dark:text-on-surface-dark-muted flex items-center gap-1">
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
									<Show
										when={local.replyToAuthorId}
										fallback={<span class="font-medium">{author()}</span>}
									>
										<A
											href={`/user/${local.replyToAuthorId}`}
											class="font-medium hover:text-brand dark:hover:text-brand-dark transition-colors"
										>
											{author()}
										</A>
									</Show>
								</span>
							)}
						</Show>
						<span class="text-xs text-on-surface-muted dark:text-on-surface-dark-muted">
							{local.timestamp}
						</span>
						<Show when={local.editedAt}>
							{(editedAt) => (
								<span
									class="text-xs text-on-surface-muted dark:text-on-surface-dark-muted italic"
									title={`Edited ${editedAt()}`}
								>
									(edited)
								</span>
							)}
						</Show>
					</Flex>

					{/* Action buttons */}
					<Show when={!local.isDeleted}>
						<Flex gap="sm" align="center">
							<Show when={local.onEdit}>
								<button
									type="button"
									onClick={local.onEdit}
									class="text-xs text-on-surface-muted dark:text-on-surface-dark-muted hover:text-primary dark:hover:text-primary-dark transition-colors"
								>
									Edit
								</button>
							</Show>
							<Show when={local.onDelete}>
								<button
									type="button"
									onClick={local.onDelete}
									class="text-xs text-on-surface-muted dark:text-on-surface-dark-muted hover:text-danger transition-colors"
								>
									Delete
								</button>
							</Show>
							<Show when={local.onReply}>
								<button
									type="button"
									onClick={local.onReply}
									class="text-xs text-on-surface-muted dark:text-on-surface-dark-muted hover:text-primary dark:hover:text-primary-dark transition-colors"
								>
									Reply
								</button>
							</Show>
						</Flex>
					</Show>
				</Flex>
			</div>

			{/* Content */}
			<div class="p-4 bg-surface dark:bg-surface-dark">
				<Show
					when={!local.isDeleted}
					fallback={
						<p class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted italic">
							This comment has been deleted.
						</p>
					}
				>
					<MarkdownOutput content={local.content} />
				</Show>
			</div>
		</div>
	);
};

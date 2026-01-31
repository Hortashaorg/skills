import { createSignal, For, Show } from "solid-js";
import { Stack } from "@/components/primitives/stack";
import { MarkdownField } from "../markdown";
import type { ToolbarModule } from "../toolbar";
import { CommentCard } from "./comment-card";
import type { Comment } from "./types";

type CommentThreadProps = {
	comments: Comment[];
	currentUser?: string;
	onSubmit?: (content: string, replyTo: Comment | null) => void;
	onEdit?: (comment: Comment, newContent: string) => void;
	modules?: ToolbarModule[];
};

export const CommentThread = (props: CommentThreadProps) => {
	const [reply, setReply] = createSignal("");
	const [replyingTo, setReplyingTo] = createSignal<Comment | null>(null);

	const findParentId = (comment: Comment): string => {
		for (const topLevel of props.comments) {
			if (topLevel.replies?.some((r) => r.id === comment.id)) {
				return topLevel.id;
			}
		}
		return comment.id;
	};

	const replyingToParentId = () => {
		const rt = replyingTo();
		return rt ? findParentId(rt) : null;
	};

	const handleReply = (comment: Comment) => {
		setReplyingTo(comment);

		const quoted = comment.content
			.split("\n")
			.map((line) => `> ${line}`)
			.join("\n");

		setReply(`${quoted}\n\n`);
	};

	const handleSubmit = () => {
		props.onSubmit?.(reply(), replyingTo());
		setReply("");
		setReplyingTo(null);
	};

	const handleEdit = (comment: Comment, newContent: string) => {
		props.onEdit?.(comment, newContent);
	};

	const clearReplyTo = () => {
		setReplyingTo(null);
		setReply("");
	};

	return (
		<Stack spacing="md">
			{/* Comments */}
			<For each={props.comments}>
				{(comment) => (
					<CommentCard
						comment={comment}
						currentUser={props.currentUser}
						onReply={handleReply}
						onEdit={handleEdit}
						replyingToId={replyingToParentId()}
						replyContent={reply()}
						onReplyInput={setReply}
						onReplySubmit={handleSubmit}
						onReplyCancel={clearReplyTo}
					/>
				)}
			</For>

			{/* Main reply editor - only show when not replying inline */}
			<Show when={!replyingToParentId() && props.currentUser}>
				<div class="flex gap-3">
					<div class="shrink-0 w-10 h-10 rounded-full bg-secondary/20 dark:bg-secondary-dark/20 flex items-center justify-center text-sm font-medium text-secondary dark:text-secondary-dark">
						{props.currentUser?.charAt(0).toUpperCase()}
					</div>
					<div class="flex-1">
						<MarkdownField
							value={reply()}
							onInput={setReply}
							onSubmit={handleSubmit}
							submitLabel="Comment"
							modules={props.modules}
						/>
					</div>
				</div>
			</Show>
		</Stack>
	);
};

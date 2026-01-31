import { type JSX, Show, splitProps } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Text } from "@/components/primitives/text";
import { MarkdownOutput } from "@/components/ui/markdown-output";
import { cn } from "@/lib/utils";

export type CommentAuthor = {
	name: string;
	avatarUrl?: string;
};

export type CommentCardProps = Omit<
	JSX.IntrinsicElements["div"],
	"children"
> & {
	author: CommentAuthor;
	content: string;
	timestamp: string;
	isDeleted?: boolean;
	isEdited?: boolean;
	isCompact?: boolean;
	replyToAuthor?: string;
	onReply?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
};

export const CommentCard = (props: CommentCardProps) => {
	const [local, others] = splitProps(props, [
		"author",
		"content",
		"timestamp",
		"isDeleted",
		"isEdited",
		"isCompact",
		"replyToAuthor",
		"onReply",
		"onEdit",
		"onDelete",
		"class",
	]);

	const avatarSize = () =>
		local.isCompact ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
	const initials = () => local.author.name.charAt(0).toUpperCase();

	return (
		<div class={cn("flex gap-3", local.class)} {...others}>
			{/* Avatar */}
			<Show
				when={local.author.avatarUrl}
				fallback={
					<div
						class={cn(
							"shrink-0 rounded-full flex items-center justify-center font-medium",
							"bg-primary/20 dark:bg-primary-dark/20",
							"text-primary dark:text-primary-dark",
							avatarSize(),
						)}
					>
						{initials()}
					</div>
				}
			>
				<img
					src={local.author.avatarUrl}
					alt={local.author.name}
					class={cn("shrink-0 rounded-full object-cover", avatarSize())}
				/>
			</Show>

			{/* Comment body */}
			<div class="flex-1 min-w-0">
				<div class="rounded-radius border border-outline dark:border-outline-dark overflow-hidden">
					{/* Header */}
					<div class="px-4 py-2 bg-surface-alt/50 dark:bg-surface-dark-alt/50 border-b border-outline dark:border-outline-dark">
						<Flex gap="sm" align="center" justify="between">
							<Flex gap="sm" align="center" class="flex-wrap">
								<Text weight="semibold" size="sm">
									{local.author.name}
								</Text>

								<Show when={local.replyToAuthor}>
									<Flex
										gap="xs"
										align="center"
										class="text-on-surface/50 dark:text-on-surface-dark/50"
									>
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
										<Text size="xs" color="muted" weight="medium">
											{local.replyToAuthor}
										</Text>
									</Flex>
								</Show>

								<Text size="xs" color="muted">
									{local.timestamp}
								</Text>

								<Show when={local.isEdited && !local.isDeleted}>
									<Text size="xs" color="muted" class="italic">
										(edited)
									</Text>
								</Show>
							</Flex>

							{/* Actions */}
							<Show when={!local.isDeleted}>
								<Flex gap="sm" align="center">
									<Show when={local.onEdit}>
										<button
											type="button"
											onClick={local.onEdit}
											class="text-xs text-on-surface/50 dark:text-on-surface-dark/50 hover:text-primary dark:hover:text-primary-dark transition-colors"
										>
											Edit
										</button>
									</Show>
									<Show when={local.onDelete}>
										<button
											type="button"
											onClick={local.onDelete}
											class="text-xs text-on-surface/50 dark:text-on-surface-dark/50 hover:text-danger transition-colors"
										>
											Delete
										</button>
									</Show>
									<Show when={local.onReply}>
										<button
											type="button"
											onClick={local.onReply}
											class="text-xs text-on-surface/50 dark:text-on-surface-dark/50 hover:text-primary dark:hover:text-primary-dark transition-colors"
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
								<Text size="sm" color="muted" class="italic">
									This comment was deleted
								</Text>
							}
						>
							<MarkdownOutput content={local.content} />
						</Show>
					</div>
				</div>
			</div>
		</div>
	);
};

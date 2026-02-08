import { formatShortDate } from "@package/common";
import type { Row } from "@package/database/client";
import { A } from "@solidjs/router";
import { Show } from "solid-js";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
import { UpvoteButton } from "@/components/ui/upvote-button";
import { getDisplayName } from "@/lib/account";

type ProjectWithPackages = Row["projects"] & {
	account?: Row["account"] | null;
};

interface ProjectCardProps {
	project: ProjectWithPackages;
	showAuthor?: boolean;
	upvoteCount?: number;
	isUpvoted?: boolean;
	upvoteDisabled?: boolean;
	onUpvote?: () => void;
}

export const ProjectCard = (props: ProjectCardProps) => {
	return (
		<Card
			padding="md"
			class="relative h-full transition-colors hover:bg-surface-alt dark:hover:bg-surface-dark-alt has-[[data-upvote]:hover]:bg-transparent dark:has-[[data-upvote]:hover]:bg-transparent has-[[data-author]:hover]:bg-transparent dark:has-[[data-author]:hover]:bg-transparent"
		>
			<A
				href={`/projects/${props.project.id}`}
				class="absolute inset-0"
				tabIndex={-1}
				aria-label={`View ${props.project.name}`}
			/>

			<div class="relative pointer-events-none flex flex-col h-full gap-1.5">
				<Text weight="semibold" class="truncate">
					{props.project.name}
				</Text>

				<Show when={props.project.description}>
					<Text size="sm" color="muted" class="line-clamp-2 flex-1">
						{props.project.description}
					</Text>
				</Show>

				<div class="flex items-end justify-between gap-2 mt-auto pt-1">
					<div class="flex items-center gap-1.5 min-w-0">
						<Show
							when={props.showAuthor}
							fallback={
								<Text size="xs" color="muted">
									{formatShortDate(props.project.updatedAt)}
								</Text>
							}
						>
							<Text size="xs" color="muted">
								by{" "}
								<Show
									when={props.project.account?.id}
									fallback={
										<span>{getDisplayName(props.project.account)}</span>
									}
								>
									{(accountId) => (
										<A
											href={`/user/${accountId()}`}
											class="pointer-events-auto hover:text-brand dark:hover:text-brand-dark transition-colors"
											onClick={(e) => e.stopPropagation()}
											data-author
										>
											{getDisplayName(props.project.account)}
										</A>
									)}
								</Show>
							</Text>
						</Show>
					</div>

					<Show when={props.onUpvote}>
						{(onUpvote) => (
							<div
								class="flex items-center shrink-0 pointer-events-auto"
								data-upvote
							>
								<UpvoteButton
									count={props.upvoteCount ?? 0}
									isUpvoted={props.isUpvoted ?? false}
									disabled={props.upvoteDisabled ?? true}
									onClick={onUpvote()}
								/>
							</div>
						)}
					</Show>
				</div>
			</div>
		</Card>
	);
};

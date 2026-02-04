import { formatShortDate } from "@package/common";
import type { Row } from "@package/database/client";
import { A } from "@solidjs/router";
import { Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
import { getDisplayName } from "@/lib/account";

type ProjectWithPackages = Row["projects"] & {
	projectPackages?: readonly Row["projectPackages"][];
	account?: Row["account"] | null;
};

interface ProjectCardProps {
	project: ProjectWithPackages;
	showAuthor?: boolean;
}

export const ProjectCard = (props: ProjectCardProps) => {
	const packageCount = () => props.project.projectPackages?.length ?? 0;

	return (
		<A href={`/projects/${props.project.id}`}>
			<Card
				padding="md"
				class="h-full hover:bg-surface-alt dark:hover:bg-surface-dark-alt has-[[data-author]:hover]:bg-transparent dark:has-[[data-author]:hover]:bg-transparent transition-colors cursor-pointer"
			>
				<Stack spacing="sm">
					<Text weight="semibold" class="truncate">
						{props.project.name}
					</Text>
					<Show when={props.project.description}>
						<Text size="sm" color="muted" class="line-clamp-2">
							{props.project.description}
						</Text>
					</Show>
					<Flex
						justify="between"
						align="center"
						class="pt-2 border-t border-outline/50 dark:border-outline-dark/50"
					>
						<Text size="xs" color="muted">
							{packageCount()} package{packageCount() !== 1 ? "s" : ""}
						</Text>
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
											class="hover:text-brand dark:hover:text-brand-dark transition-colors"
											onClick={(e) => e.stopPropagation()}
											data-author
										>
											{getDisplayName(props.project.account)}
										</A>
									)}
								</Show>
							</Text>
						</Show>
					</Flex>
				</Stack>
			</Card>
		</A>
	);
};

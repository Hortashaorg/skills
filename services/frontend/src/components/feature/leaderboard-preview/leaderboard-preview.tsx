import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";

export type LeaderboardEntry = {
	rank: number;
	name: string;
	score: number;
	isCurrentUser?: boolean;
};

export type LeaderboardPreviewProps = {
	entries: readonly LeaderboardEntry[];
	title?: string;
	subtitle?: string;
	viewAllHref?: string;
	viewAllText?: string;
};

export const LeaderboardPreview = (props: LeaderboardPreviewProps) => {
	const title = () => props.title ?? "Top Contributors";
	const subtitle = () => props.subtitle ?? "This month";
	const viewAllText = () => props.viewAllText ?? "View full leaderboard";

	return (
		<Card padding="md">
			<Stack spacing="sm">
				<Flex justify="between" align="center">
					<Heading level="h3">{title()}</Heading>
					<Text size="xs" color="muted">
						{subtitle()}
					</Text>
				</Flex>

				<Show
					when={props.entries.length > 0}
					fallback={
						<Text size="sm" color="muted" class="py-4 text-center">
							No contributions yet
						</Text>
					}
				>
					<div class="space-y-1">
						<For each={props.entries}>
							{(entry) => (
								<Flex
									justify="between"
									align="center"
									class="px-2 py-1.5 rounded-radius"
									classList={{
										"bg-brand/10 dark:bg-brand-dark/10": entry.isCurrentUser,
									}}
								>
									<Flex gap="sm" align="center" class="min-w-0">
										<Text
											size="sm"
											weight={entry.rank <= 3 ? "semibold" : "normal"}
											class="w-5 shrink-0"
										>
											{entry.rank}.
										</Text>
										<Text
											size="sm"
											weight={entry.isCurrentUser ? "semibold" : "normal"}
											class="truncate"
										>
											{entry.name}
											{entry.isCurrentUser && " (you)"}
										</Text>
									</Flex>
									<Text
										size="sm"
										weight="medium"
										color={entry.isCurrentUser ? "default" : "muted"}
									>
										{entry.score} pts
									</Text>
								</Flex>
							)}
						</For>
					</div>
				</Show>

				<Show when={props.viewAllHref} keyed>
					{(href) => (
						<A
							href={href}
							class="text-sm text-brand dark:text-brand-dark hover:underline text-center pt-2 block"
						>
							{viewAllText()} →
						</A>
					)}
				</Show>
			</Stack>
		</Card>
	);
};

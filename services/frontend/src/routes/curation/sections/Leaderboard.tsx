import { queries, useQuery, useZero } from "@package/database/client";
import { createMemo, createSignal, For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";

export const Leaderboard = () => {
	const zero = useZero();
	const currentUserId = () => zero().userID;

	const [tab, setTab] = createSignal<"monthly" | "allTime">("monthly");

	const [monthlyLeaderboard] = useQuery(() =>
		queries.contributionScores.leaderboardMonthly({ limit: 50 }),
	);

	const [allTimeLeaderboard] = useQuery(() =>
		queries.contributionScores.leaderboardAllTime({ limit: 50 }),
	);

	const [myScore] = useQuery(() =>
		queries.contributionScores.forUser({ accountId: currentUserId() }),
	);

	const activeLeaderboard = createMemo(() => {
		return tab() === "monthly" ? monthlyLeaderboard() : allTimeLeaderboard();
	});

	const userRank = createMemo(() => {
		const leaderboard = activeLeaderboard();
		if (!leaderboard) return null;
		const userId = currentUserId();
		const index = leaderboard.findIndex((s) => s.accountId === userId);
		return index >= 0 ? index + 1 : null;
	});

	return (
		<Card padding="md">
			<Stack spacing="sm">
				<Heading level="h3">Leaderboard</Heading>

				<Tabs.Root
					value={tab()}
					onChange={(v) => setTab(v as "monthly" | "allTime")}
				>
					<Tabs.List>
						<Tabs.Trigger value="monthly">Monthly</Tabs.Trigger>
						<Tabs.Trigger value="allTime">All Time</Tabs.Trigger>
					</Tabs.List>
				</Tabs.Root>

				<Show
					when={activeLeaderboard()?.length}
					fallback={
						<Text size="sm" color="muted" class="py-4 text-center">
							No contributions yet
						</Text>
					}
				>
					<div class="space-y-1 max-h-96 overflow-y-auto">
						<For each={activeLeaderboard()}>
							{(score, index) => (
								<Flex
									justify="between"
									align="center"
									class="px-2 py-1.5 rounded hover:bg-surface-alt dark:hover:bg-surface-dark-alt"
									classList={{
										"bg-brand/10 dark:bg-brand-dark/10":
											score.accountId === currentUserId(),
									}}
								>
									<Flex gap="sm" align="center">
										<Text
											size="sm"
											weight={index() < 3 ? "semibold" : "normal"}
											class="w-6"
										>
											{index() + 1}.
										</Text>
										<Text
											size="sm"
											weight={
												score.accountId === currentUserId()
													? "semibold"
													: "normal"
											}
										>
											{score.account?.name ?? "Unknown"}
											{score.accountId === currentUserId() && " (you)"}
										</Text>
									</Flex>
									<Text size="sm" weight="medium">
										{tab() === "monthly"
											? score.monthlyScore
											: score.allTimeScore}
									</Text>
								</Flex>
							)}
						</For>
					</div>
				</Show>

				<Show when={myScore() && !userRank()}>
					<div class="pt-2 border-t border-outline dark:border-outline-dark">
						<Flex justify="between" align="center" class="px-2 py-1.5">
							<Text size="sm">Your score</Text>
							<Text size="sm" weight="medium">
								{tab() === "monthly"
									? (myScore()?.monthlyScore ?? 0)
									: (myScore()?.allTimeScore ?? 0)}
							</Text>
						</Flex>
					</div>
				</Show>
			</Stack>
		</Card>
	);
};

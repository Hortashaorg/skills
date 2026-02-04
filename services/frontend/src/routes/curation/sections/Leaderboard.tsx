import { queries, useQuery, useZero } from "@package/database/client";
import { A } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Input } from "@/components/primitives/input";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { useUserSearch } from "@/hooks/users";
import { getDisplayName } from "@/lib/account";

export const Leaderboard = () => {
	const zero = useZero();
	const currentUserId = () => zero().userID;

	const [tab, setTab] = createSignal<"monthly" | "allTime">("monthly");
	const [searchQuery, setSearchQuery] = createSignal("");

	// Use search hooks for both tabs
	const monthlySearch = useUserSearch({
		showRecentWhenEmpty: true,
		sortBy: "monthlyScore",
	});

	const allTimeSearch = useUserSearch({
		showRecentWhenEmpty: true,
		sortBy: "allTimeScore",
	});

	// Sync search query to both hooks
	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		monthlySearch.setQuery(value);
		allTimeSearch.setQuery(value);
	};

	// Get active search based on tab
	const activeSearch = () =>
		tab() === "monthly" ? monthlySearch : allTimeSearch;

	const [myScore] = useQuery(() =>
		queries.contributionScores.forUser({ accountId: currentUserId() }),
	);

	// Check if monthly has any scores (for fallback display)
	const hasMonthlyScores = createMemo(() => {
		const results = monthlySearch.results();
		const exact = monthlySearch.exactMatch();
		const hasResultScores = results.some(
			(u) => (u.contributionScore?.monthlyScore ?? 0) > 0,
		);
		const hasExactScore = (exact?.contributionScore?.monthlyScore ?? 0) > 0;
		return hasResultScores || hasExactScore;
	});

	// For monthly tab with no monthly scores, show all-time users but with 0 score
	const isMonthlyFallback = createMemo(() => {
		if (tab() !== "monthly") return false;
		return !hasMonthlyScores();
	});

	// Get display results - filter out zero scores except for fallback case
	const displayResults = createMemo(() => {
		const search = activeSearch();
		const results = search.results();

		if (tab() === "allTime") {
			return results.filter(
				(u) => (u.contributionScore?.allTimeScore ?? 0) > 0,
			);
		}

		// Monthly tab
		if (hasMonthlyScores()) {
			return results.filter(
				(u) => (u.contributionScore?.monthlyScore ?? 0) > 0,
			);
		}

		// Fallback: show all-time users (they'll display 0 for monthly)
		return allTimeSearch
			.results()
			.filter((u) => (u.contributionScore?.allTimeScore ?? 0) > 0);
	});

	// Get exact match for current tab
	const exactMatch = () => activeSearch().exactMatch();

	// Check if exact match is already in results
	const isExactMatchInResults = createMemo(() => {
		const match = exactMatch();
		if (!match) return false;
		return displayResults().some((u) => u.id === match.id);
	});

	// Get the rank of the exact match user based on their score
	const exactMatchRank = createMemo(() => {
		const match = exactMatch();
		if (!match) return null;

		const matchScore =
			tab() === "monthly"
				? (match.contributionScore?.monthlyScore ?? 0)
				: (match.contributionScore?.allTimeScore ?? 0);

		// If they have no score, no rank
		if (matchScore <= 0) return null;

		// Count how many users in results have a higher score
		const results = displayResults();
		const higherCount = results.filter((u) => {
			const score =
				tab() === "monthly"
					? (u.contributionScore?.monthlyScore ?? 0)
					: (u.contributionScore?.allTimeScore ?? 0);
			return score > matchScore;
		}).length;

		return higherCount + 1;
	});

	return (
		<Card padding="md">
			<Stack spacing="sm">
				<Heading level="h3">Leaderboard</Heading>

				<Input
					type="text"
					value={searchQuery()}
					onInput={(e) => handleSearchChange(e.currentTarget.value)}
					placeholder="Search users..."
					aria-label="Search users"
					size="sm"
				/>

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
					when={displayResults().length > 0 || exactMatch()}
					fallback={
						<Text size="sm" color="muted" class="py-4 text-center">
							{searchQuery().trim()
								? `No users matching "${searchQuery().trim()}"`
								: "No contributions yet"}
						</Text>
					}
				>
					<div class="space-y-1 max-h-96 overflow-y-auto">
						{/* Exact match floated to top if not in results */}
						<Show when={!isExactMatchInResults() ? exactMatch() : undefined}>
							{(match) => {
								const user = () => match();
								const score = () =>
									tab() === "monthly"
										? isMonthlyFallback()
											? 0
											: (user().contributionScore?.monthlyScore ?? 0)
										: (user().contributionScore?.allTimeScore ?? 0);
								return (
									<Flex
										justify="between"
										align="center"
										class="px-2 py-1.5 rounded hover:bg-surface-alt dark:hover:bg-surface-dark-alt"
										classList={{
											"bg-brand/10 dark:bg-brand-dark/10":
												user().id === currentUserId(),
										}}
									>
										<Flex gap="sm" align="center">
											<Text
												size="sm"
												weight={
													(exactMatchRank() ?? 0) <= 3 && exactMatchRank()
														? "semibold"
														: "normal"
												}
												class="w-6"
											>
												{exactMatchRank() ? `${exactMatchRank()}.` : "—"}
											</Text>
											<A href={`/user/${user().id}`} class="hover:underline">
												<Flex gap="xs" align="center">
													<Text
														size="sm"
														weight={
															user().id === currentUserId()
																? "semibold"
																: "normal"
														}
													>
														{getDisplayName(user())}
														{user().id === currentUserId() && " (you)"}
													</Text>
													<Badge variant="info" size="sm">
														Exact match
													</Badge>
												</Flex>
											</A>
										</Flex>
										<Text size="sm" weight="medium">
											{score()}
										</Text>
									</Flex>
								);
							}}
						</Show>

						<For each={displayResults()}>
							{(user, index) => {
								const isExactMatch = () =>
									exactMatch()?.id === user.id && searchQuery().trim();
								return (
									<Flex
										justify="between"
										align="center"
										class="px-2 py-1.5 rounded hover:bg-surface-alt dark:hover:bg-surface-dark-alt"
										classList={{
											"bg-brand/10 dark:bg-brand-dark/10":
												user.id === currentUserId(),
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
											<A href={`/user/${user.id}`} class="hover:underline">
												<Flex gap="xs" align="center">
													<Text
														size="sm"
														weight={
															user.id === currentUserId()
																? "semibold"
																: "normal"
														}
													>
														{getDisplayName(user)}
														{user.id === currentUserId() && " (you)"}
													</Text>
													<Show when={isExactMatch()}>
														<Badge variant="info" size="sm">
															Exact match
														</Badge>
													</Show>
												</Flex>
											</A>
										</Flex>
										<Text size="sm" weight="medium">
											{tab() === "monthly"
												? isMonthlyFallback()
													? 0
													: (user.contributionScore?.monthlyScore ?? 0)
												: (user.contributionScore?.allTimeScore ?? 0)}
										</Text>
									</Flex>
								);
							}}
						</For>
					</div>
				</Show>

				<Show when={myScore()}>
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

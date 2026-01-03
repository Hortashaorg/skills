import { mutators, queries, useQuery, useZero } from "@package/database/client";
import { A, useNavigate } from "@solidjs/router";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import { getAuthData } from "@/context/app-provider";
import { Layout } from "@/layout/Layout";
import { buildPackageUrl } from "@/lib/url";

export const Curation = () => {
	const zero = useZero();
	const navigate = useNavigate();
	const isLoggedIn = () => zero().userID !== "anon";
	const isAdmin = () => getAuthData()?.roles?.includes("admin") ?? false;
	const currentUserId = () => zero().userID;

	// Redirect to home if not logged in
	createEffect(() => {
		if (!isLoggedIn()) {
			navigate("/", { replace: true });
		}
	});

	const [leaderboardTab, setLeaderboardTab] = createSignal<
		"monthly" | "allTime"
	>("monthly");

	// Get pending suggestions - admins see all, regular users exclude own
	const [allPending] = useQuery(() => queries.suggestions.pending());
	const [pendingExcludingOwn] = useQuery(() =>
		queries.suggestions.pendingExcludingUser({
			excludeAccountId: currentUserId(),
		}),
	);
	const pendingSuggestions = () =>
		isAdmin() ? allPending() : pendingExcludingOwn();

	// Get all tags for name lookup
	const [allTags] = useQuery(() => queries.tags.list());

	const tagsById = createMemo(() => {
		const all = allTags() ?? [];
		return new Map(all.map((t) => [t.id, t]));
	});

	// Leaderboard queries
	const [monthlyLeaderboard] = useQuery(() =>
		queries.contributionScores.leaderboardMonthly({ limit: 50 }),
	);

	const [allTimeLeaderboard] = useQuery(() =>
		queries.contributionScores.leaderboardAllTime({ limit: 50 }),
	);

	// Current user's score (for anon, will return nothing which is expected)
	const [myScore] = useQuery(() =>
		queries.contributionScores.forUser({ accountId: currentUserId() }),
	);

	// Get current suggestion to review (first in queue)
	const currentSuggestion = createMemo(() => {
		const suggestions = pendingSuggestions();
		if (!suggestions || suggestions.length === 0) return null;
		return suggestions[0];
	});

	// Check if current suggestion is user's own
	const isOwnSuggestion = createMemo(() => {
		const suggestion = currentSuggestion();
		if (!suggestion) return false;
		return suggestion.accountId === currentUserId();
	});

	// Check if user already voted on current suggestion
	const hasVotedOnCurrent = createMemo(() => {
		const suggestion = currentSuggestion();
		if (!suggestion) return false;
		const userId = currentUserId();
		return (suggestion.votes ?? []).some((v) => v.accountId === userId);
	});

	// Get vote counts for current suggestion
	const currentVoteCounts = createMemo(() => {
		const suggestion = currentSuggestion();
		const votes = suggestion?.votes ?? [];
		return {
			approve: votes.filter((v) => v.vote === "approve").length,
			reject: votes.filter((v) => v.vote === "reject").length,
		};
	});

	// Helper to get tag name from suggestion payload
	const getTagNameFromPayload = (payload: unknown): string => {
		const p = payload as { tagId?: string };
		if (p?.tagId) {
			return tagsById().get(p.tagId)?.name ?? "Unknown tag";
		}
		return "Unknown";
	};

	// Cast vote
	const handleVote = async (voteType: "approve" | "reject") => {
		const suggestion = currentSuggestion();
		if (!suggestion) return;

		try {
			await zero().mutate(
				mutators.suggestionVotes.vote({
					suggestionId: suggestion.id,
					vote: voteType,
				}),
			);
			toast.success(
				"Your vote has been recorded.",
				voteType === "approve" ? "Approved" : "Rejected",
			);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Unknown error",
				"Failed to vote",
			);
		}
	};

	// Get active leaderboard
	const activeLeaderboard = createMemo(() => {
		return leaderboardTab() === "monthly"
			? monthlyLeaderboard()
			: allTimeLeaderboard();
	});

	// Check if user is in top 50
	const userRank = createMemo(() => {
		const leaderboard = activeLeaderboard();
		if (!leaderboard) return null;
		const userId = currentUserId();
		const index = leaderboard.findIndex((s) => s.accountId === userId);
		return index >= 0 ? index + 1 : null;
	});

	return (
		<Layout>
			<Container size="lg">
				<Stack spacing="lg" class="py-8">
					<div>
						<Heading level="h1">Community Curation</Heading>
						<Text color="muted">
							Review tag suggestions and help improve package discoverability.
						</Text>
					</div>

					<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Review Queue - Main content */}
						<div class="lg:col-span-2">
							<Card padding="lg">
								<Stack spacing="md">
									<Heading level="h3">Review Queue</Heading>

									<Show
										when={currentSuggestion()}
										fallback={
											<Stack spacing="sm" align="center" class="py-8">
												<Text color="muted">No suggestions to review</Text>
												<Text size="sm" color="muted">
													Check back later or suggest tags on package pages.
												</Text>
											</Stack>
										}
									>
										{(suggestion) => (
											<Stack spacing="md">
												{/* Unified suggestion display */}
												<div class="p-4 bg-surface-alt dark:bg-surface-dark-alt rounded-radius">
													<Stack spacing="sm">
														<Show when={isOwnSuggestion() && isAdmin()}>
															<Badge variant="warning" size="sm">
																Your suggestion
															</Badge>
														</Show>
														<Text size="lg" weight="semibold">
															Add tag "
															{getTagNameFromPayload(suggestion().payload)}"
														</Text>
														<Flex gap="xs" align="center">
															<Text size="sm" color="muted">
																to
															</Text>
															<A
																href={buildPackageUrl(
																	suggestion().package?.registry ?? "npm",
																	suggestion().package?.name ?? "",
																)}
																class="text-sm font-medium hover:text-primary dark:hover:text-primary-dark"
															>
																{suggestion().package?.name ?? "Unknown"}
															</A>
															<Text size="sm" color="muted">
																({suggestion().package?.registry})
															</Text>
														</Flex>
														<Show when={suggestion().package?.description}>
															<Text
																size="xs"
																color="muted"
																class="line-clamp-2"
															>
																{suggestion().package?.description}
															</Text>
														</Show>
														<div class="pt-2 border-t border-outline/50 dark:border-outline-dark/50">
															<Flex gap="md" align="center">
																<Text size="xs" color="muted">
																	by {suggestion().account?.name ?? "Unknown"}
																</Text>
																<Flex gap="xs">
																	<Badge variant="success" size="sm">
																		+{currentVoteCounts().approve}
																	</Badge>
																	<Badge variant="danger" size="sm">
																		-{currentVoteCounts().reject}
																	</Badge>
																</Flex>
															</Flex>
														</div>
													</Stack>
												</div>

												{/* Vote buttons */}
												<Show
													when={!hasVotedOnCurrent()}
													fallback={
														<Text size="sm" color="muted" class="text-center">
															You've already voted on this suggestion.
														</Text>
													}
												>
													<Flex gap="md" justify="center">
														<Button
															size="lg"
															variant="primary"
															onClick={() => handleVote("approve")}
														>
															Approve
														</Button>
														<Button
															size="lg"
															variant="outline"
															onClick={() => handleVote("reject")}
														>
															Reject
														</Button>
													</Flex>
												</Show>
											</Stack>
										)}
									</Show>
								</Stack>
							</Card>

							{/* Admin backlog - full list */}
							<Show when={isAdmin() && pendingSuggestions()?.length}>
								<Card padding="md" class="mt-4">
									<Stack spacing="sm">
										<Flex justify="between" align="center">
											<Heading level="h4">
												All Pending ({pendingSuggestions()?.length ?? 0})
											</Heading>
										</Flex>
										<div class="max-h-64 overflow-y-auto space-y-2">
											<For each={pendingSuggestions()}>
												{(suggestion) => {
													const isOwn = () =>
														suggestion.accountId === currentUserId();
													const isCurrent = () =>
														suggestion.id === currentSuggestion()?.id;
													return (
														<div
															class="p-2 rounded text-sm border border-outline dark:border-outline-dark"
															classList={{
																"bg-primary/10 dark:bg-primary-dark/10 border-primary dark:border-primary-dark":
																	isCurrent(),
															}}
														>
															<Flex justify="between" align="start" gap="sm">
																<Stack spacing="xs" class="flex-1 min-w-0">
																	<Flex gap="xs" align="center" wrap="wrap">
																		<Text
																			size="sm"
																			weight={
																				isCurrent() ? "semibold" : "normal"
																			}
																			class="truncate"
																		>
																			{getTagNameFromPayload(
																				suggestion.payload,
																			)}
																		</Text>
																		<Text size="xs" color="muted">
																			→
																		</Text>
																		<Text
																			size="xs"
																			color="muted"
																			class="truncate"
																		>
																			{suggestion.package?.name}
																		</Text>
																	</Flex>
																	<Flex gap="xs" align="center">
																		<Text size="xs" color="muted">
																			by {suggestion.account?.name}
																		</Text>
																		<Show when={isOwn()}>
																			<Badge variant="warning" size="sm">
																				you
																			</Badge>
																		</Show>
																	</Flex>
																</Stack>
																<Flex gap="xs" class="shrink-0">
																	<Badge variant="success" size="sm">
																		+
																		{
																			(suggestion.votes ?? []).filter(
																				(v) => v.vote === "approve",
																			).length
																		}
																	</Badge>
																	<Badge variant="danger" size="sm">
																		-
																		{
																			(suggestion.votes ?? []).filter(
																				(v) => v.vote === "reject",
																			).length
																		}
																	</Badge>
																</Flex>
															</Flex>
														</div>
													);
												}}
											</For>
										</div>
									</Stack>
								</Card>
							</Show>
						</div>

						{/* Leaderboard - Sidebar */}
						<div>
							<Card padding="md">
								<Stack spacing="sm">
									<Heading level="h3">Leaderboard</Heading>

									<Tabs.Root
										value={leaderboardTab()}
										onChange={(v) =>
											setLeaderboardTab(v as "monthly" | "allTime")
										}
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
															"bg-primary/10 dark:bg-primary-dark/10":
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
																{score.accountId === currentUserId() &&
																	" (you)"}
															</Text>
														</Flex>
														<Text size="sm" weight="medium">
															{leaderboardTab() === "monthly"
																? score.monthlyScore
																: score.allTimeScore}
														</Text>
													</Flex>
												)}
											</For>
										</div>
									</Show>

									{/* Show user's rank if not in top 50 */}
									<Show when={myScore() && !userRank()}>
										<div class="pt-2 border-t border-outline dark:border-outline-dark">
											<Flex
												justify="between"
												align="center"
												class="px-2 py-1.5"
											>
												<Text size="sm">Your score</Text>
												<Text size="sm" weight="medium">
													{leaderboardTab() === "monthly"
														? (myScore()?.monthlyScore ?? 0)
														: (myScore()?.allTimeScore ?? 0)}
												</Text>
											</Flex>
										</div>
									</Show>
								</Stack>
							</Card>

							{/* Points info */}
							<Card padding="md" class="mt-4">
								<Stack spacing="xs">
									<Text size="sm" weight="semibold">
										How points work
									</Text>
									<Text size="xs" color="muted">
										+5 when your suggestion is approved
									</Text>
									<Text size="xs" color="muted">
										-1 when your suggestion is rejected
									</Text>
									<Text size="xs" color="muted">
										+1 when your vote matches the outcome
									</Text>
								</Stack>
							</Card>
						</div>
					</div>
				</Stack>
			</Container>
		</Layout>
	);
};

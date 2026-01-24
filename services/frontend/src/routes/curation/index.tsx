import {
	formatSuggestionAction,
	formatSuggestionDescription,
	mutators,
	queries,
	useQuery,
	useZero,
} from "@package/database/client";
import { useNavigate } from "@solidjs/router";
import type { Accessor } from "solid-js";
import { createEffect, createMemo, createSignal, Show } from "solid-js";
import { SEO } from "@/components/composite/seo";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { toast } from "@/components/ui/toast";
import { getAuthData } from "@/context/app-provider";
import { Layout } from "@/layout/Layout";
import { Backlog, type BacklogSuggestion } from "./sections/Backlog";
import { Leaderboard } from "./sections/Leaderboard";
import { PointsInfo } from "./sections/PointsInfo";
import {
	ReviewQueue,
	type ReviewQueueSuggestion,
} from "./sections/ReviewQueue";

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

	// Admin can select a specific suggestion to review
	const [selectedSuggestionId, setSelectedSuggestionId] = createSignal<
		string | null
	>(null);

	// Session-based skip - skipped suggestions move to end of queue
	const [skippedIds, setSkippedIds] = createSignal<Set<string>>(new Set());

	// Get pending suggestions - admins see all, regular users exclude own
	const [allPending, allPendingResult] = useQuery(() =>
		queries.suggestions.pending(),
	);
	const [pendingExcludingOwn, pendingExcludingOwnResult] = useQuery(() =>
		queries.suggestions.pendingExcludingUser({
			excludeAccountId: currentUserId(),
		}),
	);

	// Loading state - check the relevant result based on user role
	const isLoading = () => {
		const relevantResult = isAdmin()
			? allPendingResult()
			: pendingExcludingOwnResult();
		return relevantResult.type !== "complete";
	};

	// All pending (for admin backlog display)
	const allPendingSuggestions: Accessor<
		readonly BacklogSuggestion[] | undefined
	> = () =>
		(isAdmin() ? allPending() : pendingExcludingOwn()) as
			| readonly BacklogSuggestion[]
			| undefined;

	// Filter to only show suggestions user hasn't voted on (for review queue)
	// Skipped suggestions are sorted to the end
	const pendingSuggestions = createMemo(() => {
		const all = allPendingSuggestions();
		if (!all) return [];
		const userId = currentUserId();
		const skipped = skippedIds();

		const unvoted = all.filter(
			(s) => !(s.votes ?? []).some((v) => v.accountId === userId),
		);

		// Sort: non-skipped first, then skipped
		return [...unvoted].sort((a, b) => {
			const aSkipped = skipped.has(a.id);
			const bSkipped = skipped.has(b.id);
			if (aSkipped === bSkipped) return 0;
			return aSkipped ? 1 : -1;
		});
	});

	// Get all tags for name lookup
	const [allTags, allTagsResult] = useQuery(() => queries.tags.list());

	// Combined loading state for all required data
	const isDataLoading = () => {
		return isLoading() || allTagsResult().type !== "complete";
	};

	const tagsById = createMemo(() => {
		const all = allTags() ?? [];
		return new Map(all.map((t) => [t.id, t]));
	});

	// Get current suggestion to review (selected or first in queue)
	const currentSuggestion: Accessor<ReviewQueueSuggestion | null> = createMemo(
		() => {
			const suggestions = pendingSuggestions();
			if (!suggestions || suggestions.length === 0) return null;

			// If admin selected a specific suggestion, show that one
			const selectedId = selectedSuggestionId();
			if (selectedId) {
				const selected = suggestions.find((s) => s.id === selectedId);
				if (selected) return selected as ReviewQueueSuggestion;
				// Selected suggestion no longer exists (was resolved), clear selection
				setSelectedSuggestionId(null);
			}

			return suggestions[0] as ReviewQueueSuggestion;
		},
	);

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

	// Check if current suggestion was previously skipped
	const isCurrentSkipped = createMemo(() => {
		const suggestion = currentSuggestion();
		if (!suggestion) return false;
		return skippedIds().has(suggestion.id);
	});

	// Skip current suggestion - moves it to end of queue
	const handleSkip = () => {
		const suggestion = currentSuggestion();
		if (!suggestion) return;

		setSkippedIds((prev) => new Set([...prev, suggestion.id]));
		setSelectedSuggestionId(null);
	};

	// Helper to format suggestion descriptions using shared helpers
	const getDescription = (
		type: string,
		payload: unknown,
		version: number,
	): string =>
		formatSuggestionDescription(type, payload, version, { tags: tagsById() });

	const getAction = (type: string, payload: unknown, version: number): string =>
		formatSuggestionAction(type, payload, version, { tags: tagsById() });

	// Cast vote
	const handleVote = async (voteType: "approve" | "reject") => {
		const suggestion = currentSuggestion();
		if (!suggestion) return;

		const write = zero().mutate(
			mutators.suggestionVotes.vote({
				suggestionId: suggestion.id,
				vote: voteType,
			}),
		);

		const res = await write.client;

		if (res.type === "error") {
			toast.error(res.error.message, "Failed to vote");
			return;
		}

		// Clear selection so we auto-advance to next suggestion
		setSelectedSuggestionId(null);
		toast.success(
			"Your vote has been recorded.",
			voteType === "approve" ? "Approved" : "Rejected",
		);
	};

	return (
		<Layout>
			<SEO
				title="Curation"
				description="Help curate packages by reviewing tag suggestions. Vote on suggestions, earn points, and climb the leaderboard."
			/>
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
							<ReviewQueue
								suggestion={currentSuggestion}
								isLoading={isDataLoading}
								isOwnSuggestion={isOwnSuggestion}
								isAdmin={isAdmin}
								hasVoted={hasVotedOnCurrent}
								voteCounts={currentVoteCounts}
								isSkipped={isCurrentSkipped}
								formatAction={getAction}
								onVote={handleVote}
								onSkip={handleSkip}
							/>

							{/* Admin backlog */}
							<Show when={isAdmin()}>
								<Backlog
									suggestions={allPendingSuggestions}
									currentSuggestionId={() => currentSuggestion()?.id}
									formatDescription={getDescription}
									onSelect={setSelectedSuggestionId}
								/>
							</Show>
						</div>

						{/* Sidebar */}
						<div>
							<Leaderboard />
							<div class="mt-4">
								<PointsInfo />
							</div>
						</div>
					</div>
				</Stack>
			</Container>
		</Layout>
	);
};

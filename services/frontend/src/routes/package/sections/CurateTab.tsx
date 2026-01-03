import { mutators, queries, useQuery, useZero } from "@package/database/client";
import { createMemo, createSignal, For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";

interface CurateTabProps {
	packageId: string;
}

export const CurateTab = (props: CurateTabProps) => {
	const zero = useZero();
	const isLoggedIn = () => zero().userID !== "anon";
	const currentUserId = () => zero().userID;

	const [selectedTagId, setSelectedTagId] = createSignal<string>();
	const [isSubmitting, setIsSubmitting] = createSignal(false);

	// Get package with tags
	const [packageWithTags] = useQuery(() =>
		queries.packages.byIdWithTags({ id: props.packageId }),
	);

	// Get all tags for name lookup
	const [allTags] = useQuery(() => queries.tags.list());

	const tagsById = createMemo(() => {
		const all = allTags() ?? [];
		return new Map(all.map((t) => [t.id, t]));
	});

	const packageTags = createMemo(() => packageWithTags()?.packageTags ?? []);

	// Get pending suggestions for this package
	const [suggestions] = useQuery(() =>
		queries.suggestions.pendingForPackage({ packageId: props.packageId }),
	);

	// Tags available for suggestion (not already on package, not already pending)
	const availableTags = createMemo(() => {
		const all = allTags() ?? [];
		const existingTagIds = new Set(packageTags().map((pt) => pt.tagId));
		const pendingTagIds = new Set(
			(suggestions() ?? [])
				.filter((s) => s.type === "add_tag")
				.map((s) => (s.payload as { tagId?: string })?.tagId)
				.filter(Boolean),
		);

		return all
			.filter((t) => !existingTagIds.has(t.id) && !pendingTagIds.has(t.id))
			.sort((a, b) => a.name.localeCompare(b.name));
	});

	const tagOptions = createMemo(() =>
		availableTags().map((t) => ({ value: t.id, label: t.name })),
	);

	// Helper to get tag name from suggestion payload
	const getTagNameFromPayload = (payload: unknown): string => {
		const p = payload as { tagId?: string };
		if (p?.tagId) {
			return tagsById().get(p.tagId)?.name ?? "Unknown tag";
		}
		return "Unknown";
	};

	// Count votes by type
	const getVoteCounts = (votes: readonly { vote: string }[] | undefined) => {
		const v = votes ?? [];
		return {
			approve: v.filter((vote) => vote.vote === "approve").length,
			reject: v.filter((vote) => vote.vote === "reject").length,
		};
	};

	// Check if user already voted on a suggestion
	const hasVoted = (votes: readonly { accountId: string }[] | undefined) => {
		const userId = currentUserId();
		if (userId === "anon") return false;
		return (votes ?? []).some((v) => v.accountId === userId);
	};

	// Submit tag suggestion
	const handleSubmitSuggestion = async () => {
		const tagId = selectedTagId();
		if (!tagId) return;

		setIsSubmitting(true);
		try {
			await zero().mutate(
				mutators.suggestions.createAddTag({
					packageId: props.packageId,
					tagId,
				}),
			);
			setSelectedTagId(undefined);
			toast.success(
				"Your tag suggestion is now pending review.",
				"Suggestion submitted",
			);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Unknown error",
				"Failed to submit",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Cast vote
	const handleVote = async (
		suggestionId: string,
		voteType: "approve" | "reject",
	) => {
		try {
			await zero().mutate(
				mutators.suggestionVotes.vote({ suggestionId, vote: voteType }),
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

	return (
		<Stack spacing="lg">
			{/* Current tags */}
			<Card padding="md">
				<Stack spacing="sm">
					<Text weight="semibold">Current Tags</Text>
					<Show
						when={packageTags().length > 0}
						fallback={
							<Text size="sm" color="muted">
								No tags yet. Be the first to suggest one!
							</Text>
						}
					>
						<div class="flex flex-wrap gap-2">
							<For each={packageTags()}>
								{(pt) => (
									<Badge variant="secondary">
										{tagsById().get(pt.tagId)?.name ?? "Unknown"}
									</Badge>
								)}
							</For>
						</div>
					</Show>
				</Stack>
			</Card>

			{/* Suggest a tag */}
			<Card padding="md">
				<Stack spacing="sm">
					<Text weight="semibold">Suggest a Tag</Text>
					<Show
						when={isLoggedIn()}
						fallback={
							<Text size="sm" color="muted">
								Sign in to suggest tags for this package.
							</Text>
						}
					>
						<Show
							when={availableTags().length > 0}
							fallback={
								<Text size="sm" color="muted">
									All available tags are either applied or pending.
								</Text>
							}
						>
							<Flex gap="sm" align="end">
								<div class="flex-1">
									<Select
										options={tagOptions()}
										value={selectedTagId()}
										onChange={setSelectedTagId}
										placeholder="Select a tag..."
										size="sm"
										aria-label="Select a tag to suggest"
									/>
								</div>
								<Button
									size="sm"
									variant="primary"
									onClick={handleSubmitSuggestion}
									disabled={!selectedTagId() || isSubmitting()}
								>
									{isSubmitting() ? "Submitting..." : "Suggest"}
								</Button>
							</Flex>
							<Text size="xs" color="muted">
								Suggestions need 3 community votes to be approved.
							</Text>
						</Show>
					</Show>
				</Stack>
			</Card>

			{/* Pending suggestions */}
			<Card padding="md">
				<Stack spacing="sm">
					<Text weight="semibold">
						Pending Suggestions ({suggestions()?.length ?? 0})
					</Text>
					<Show
						when={suggestions()?.length}
						fallback={
							<Text size="sm" color="muted">
								No pending suggestions for this package.
							</Text>
						}
					>
						<Stack spacing="xs">
							<For each={suggestions()}>
								{(suggestion) => {
									const counts = () => getVoteCounts(suggestion.votes);
									const voted = () => hasVoted(suggestion.votes);
									const isOwn = () => suggestion.accountId === currentUserId();

									return (
										<div class="flex items-center justify-between p-3 border border-outline dark:border-outline-dark rounded-radius">
											<div>
												<Flex gap="xs" align="center">
													<Badge variant="info" size="sm">
														add tag
													</Badge>
													<Text size="sm" weight="medium">
														{getTagNameFromPayload(suggestion.payload)}
													</Text>
												</Flex>
												<Text size="xs" color="muted">
													by {suggestion.account?.name ?? "Unknown"}
												</Text>
											</div>
											<Flex gap="sm" align="center">
												<Flex gap="xs">
													<Badge variant="success" size="sm">
														+{counts().approve}
													</Badge>
													<Badge variant="danger" size="sm">
														-{counts().reject}
													</Badge>
												</Flex>
												<Show when={isLoggedIn() && !isOwn() && !voted()}>
													<Flex gap="xs">
														<Button
															size="sm"
															variant="outline"
															onClick={() =>
																handleVote(suggestion.id, "approve")
															}
														>
															Approve
														</Button>
														<Button
															size="sm"
															variant="outline"
															onClick={() =>
																handleVote(suggestion.id, "reject")
															}
														>
															Reject
														</Button>
													</Flex>
												</Show>
												<Show when={voted()}>
													<Text size="xs" color="muted">
														Voted
													</Text>
												</Show>
												<Show when={isOwn()}>
													<Text size="xs" color="muted">
														Your suggestion
													</Text>
												</Show>
											</Flex>
										</div>
									);
								}}
							</For>
						</Stack>
					</Show>
				</Stack>
			</Card>
		</Stack>
	);
};

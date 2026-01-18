import {
	formatSuggestionDescription,
	getSuggestionTypeLabel,
	mutators,
	queries,
	useQuery,
	useZero,
} from "@package/database/client";
import { For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { getDisplayName } from "@/lib/account";

interface CurateTabProps {
	ecosystemId: string;
}

export const CurateTab = (props: CurateTabProps) => {
	const zero = useZero();
	const isLoggedIn = () => zero().userID !== "anon";
	const currentUserId = () => zero().userID;

	const [pendingSuggestions] = useQuery(() =>
		queries.suggestions.pendingForEcosystem({ ecosystemId: props.ecosystemId }),
	);

	const getVoteCounts = (votes: readonly { vote: string }[] | undefined) => {
		const v = votes ?? [];
		return {
			approve: v.filter((vote) => vote.vote === "approve").length,
			reject: v.filter((vote) => vote.vote === "reject").length,
		};
	};

	const hasVoted = (votes: readonly { accountId: string }[] | undefined) => {
		const userId = currentUserId();
		if (userId === "anon") return false;
		return (votes ?? []).some((v) => v.accountId === userId);
	};

	const handleVote = (suggestionId: string, voteType: "approve" | "reject") => {
		try {
			zero().mutate(
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
			<Stack spacing="sm">
				<Text weight="semibold">
					Pending Suggestions ({pendingSuggestions()?.length ?? 0})
				</Text>
				<Text size="sm" color="muted">
					Vote on community suggestions to help curate this ecosystem.
				</Text>
			</Stack>

			<Show
				when={(pendingSuggestions()?.length ?? 0) > 0}
				fallback={
					<Text size="sm" color="muted">
						No pending suggestions for this ecosystem.
					</Text>
				}
			>
				<Stack spacing="sm">
					<For each={pendingSuggestions()}>
						{(suggestion) => {
							const counts = () => getVoteCounts(suggestion.votes);
							const voted = () => hasVoted(suggestion.votes);
							const isOwn = () => suggestion.accountId === currentUserId();
							const pkg = () => suggestion.package;

							return (
								<div class="flex items-center justify-between p-3 border border-outline dark:border-outline-dark rounded-radius">
									<div>
										<Flex gap="xs" align="center">
											<Badge variant="info" size="sm">
												{getSuggestionTypeLabel(suggestion.type)}
											</Badge>
											<Text size="sm" weight="medium">
												{pkg()?.name ??
													formatSuggestionDescription(
														suggestion.type,
														suggestion.payload,
														{},
													)}
											</Text>
											<Show when={pkg()?.registry}>
												<Badge variant="secondary" size="sm">
													{pkg()?.registry}
												</Badge>
											</Show>
										</Flex>
										<Text size="xs" color="muted">
											by {getDisplayName(suggestion.account)}
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
													onClick={() => handleVote(suggestion.id, "approve")}
												>
													Approve
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleVote(suggestion.id, "reject")}
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
	);
};

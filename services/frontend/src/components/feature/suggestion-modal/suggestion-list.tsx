import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface SuggestionVote {
	accountId: string;
	vote: "approve" | "reject";
}

export interface SuggestionItem {
	id: string;
	type: string;
	typeLabel: string;
	description: string;
	justification?: string | null;
	authorName: string;
	authorId: string;
	votes: readonly SuggestionVote[];
}

export interface SuggestionListProps {
	suggestions: readonly SuggestionItem[];
	currentUserId: string | null;
	onVote: (suggestionId: string, vote: "approve" | "reject") => void;
}

export const SuggestionList = (props: SuggestionListProps) => {
	const getVoteCounts = (votes: readonly SuggestionVote[]) => ({
		approve: votes.filter((v) => v.vote === "approve").length,
		reject: votes.filter((v) => v.vote === "reject").length,
	});

	const hasVoted = (votes: readonly SuggestionVote[]) => {
		if (!props.currentUserId) return false;
		return votes.some((v) => v.accountId === props.currentUserId);
	};

	const isOwn = (authorId: string) => authorId === props.currentUserId;

	return (
		<Show
			when={props.suggestions.length > 0}
			fallback={
				<Text size="sm" color="muted">
					No pending suggestions.
				</Text>
			}
		>
			<Stack spacing="sm">
				<For each={props.suggestions}>
					{(suggestion) => {
						const counts = () => getVoteCounts(suggestion.votes);
						const voted = () => hasVoted(suggestion.votes);
						const own = () => isOwn(suggestion.authorId);
						const isLoggedIn = () => !!props.currentUserId;

						return (
							<div class="p-3 border border-outline dark:border-outline-dark rounded-radius">
								<Flex justify="between" align="start" gap="md">
									<div class="flex-1 min-w-0">
										<Flex gap="xs" align="center" class="flex-wrap">
											<Badge variant="info" size="sm">
												{suggestion.typeLabel}
											</Badge>
											<Text size="sm" weight="medium">
												{suggestion.description}
											</Text>
										</Flex>
										<Show when={suggestion.justification}>
											<Text
												size="xs"
												color="muted"
												class="mt-1 italic line-clamp-2"
											>
												"{suggestion.justification}"
											</Text>
										</Show>
										<Text size="xs" color="muted" class="mt-1">
											by{" "}
											<A
												href={`/user/${suggestion.authorId}`}
												class="hover:text-brand dark:hover:text-brand-dark transition-colors"
											>
												{suggestion.authorName}
											</A>
										</Text>
									</div>

									<Flex gap="sm" align="center" class="shrink-0">
										<Flex gap="xs">
											<Badge variant="success" size="sm">
												+{counts().approve}
											</Badge>
											<Badge variant="danger" size="sm">
												-{counts().reject}
											</Badge>
										</Flex>

										<Show when={isLoggedIn() && !own() && !voted()}>
											<Flex gap="xs">
												<Button
													size="sm"
													variant="outline"
													onClick={() => props.onVote(suggestion.id, "approve")}
												>
													Approve
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => props.onVote(suggestion.id, "reject")}
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

										<Show when={own()}>
											<Text size="xs" color="muted">
												Yours
											</Text>
										</Show>
									</Flex>
								</Flex>
							</div>
						);
					}}
				</For>
			</Stack>
		</Show>
	);
};

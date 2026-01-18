import {
	formatSuggestionDescription,
	getSuggestionTypeLabel,
	mutators,
	queries,
	useQuery,
	useZero,
} from "@package/database/client";
import { createSignal, For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	TextField,
	TextFieldInput,
	TextFieldLabel,
} from "@/components/ui/text-field";
import { toast } from "@/components/ui/toast";
import { getDisplayName } from "@/lib/account";

export const SuggestEcosystem = () => {
	const zero = useZero();
	const isLoggedIn = () => zero().userID !== "anon";
	const currentUserId = () => zero().userID;

	const [name, setName] = createSignal("");
	const [description, setDescription] = createSignal("");
	const [website, setWebsite] = createSignal("");
	const [isSubmitting, setIsSubmitting] = createSignal(false);
	const [showForm, setShowForm] = createSignal(false);

	const [pendingSuggestions] = useQuery(() =>
		queries.suggestions.pendingCreateEcosystem(),
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

	const handleSubmit = () => {
		const ecosystemName = name().trim();
		if (!ecosystemName) {
			toast.error("Please enter an ecosystem name.", "Missing name");
			return;
		}

		setIsSubmitting(true);
		try {
			zero().mutate(
				mutators.suggestions.createCreateEcosystem({
					name: ecosystemName,
					description: description().trim() || undefined,
					website: website().trim() || undefined,
				}),
			);
			setName("");
			setDescription("");
			setWebsite("");
			setShowForm(false);
			toast.success(
				"Your ecosystem suggestion is now pending review.",
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
		<Card padding="lg">
			<Stack spacing="md">
				<Flex justify="between" align="center">
					<Text weight="semibold">Suggest New Ecosystem</Text>
					<Show when={isLoggedIn() && !showForm()}>
						<Button
							size="sm"
							variant="primary"
							onClick={() => setShowForm(true)}
						>
							Suggest
						</Button>
					</Show>
				</Flex>

				<Show
					when={isLoggedIn()}
					fallback={
						<Text size="sm" color="muted">
							Sign in to suggest new ecosystems.
						</Text>
					}
				>
					<Show when={showForm()}>
						<Stack spacing="sm">
							<TextField>
								<TextFieldLabel>Name *</TextFieldLabel>
								<TextFieldInput
									placeholder="e.g. React, Kubernetes, TailwindCSS"
									value={name()}
									onInput={(e) => setName(e.currentTarget.value)}
								/>
							</TextField>
							<TextField>
								<TextFieldLabel>Description</TextFieldLabel>
								<TextFieldInput
									placeholder="A short description of this ecosystem"
									value={description()}
									onInput={(e) => setDescription(e.currentTarget.value)}
								/>
							</TextField>
							<TextField>
								<TextFieldLabel>Website</TextFieldLabel>
								<TextFieldInput
									type="url"
									placeholder="https://example.com"
									value={website()}
									onInput={(e) => setWebsite(e.currentTarget.value)}
								/>
							</TextField>
							<Flex gap="sm" justify="end">
								<Button
									size="sm"
									variant="outline"
									onClick={() => setShowForm(false)}
								>
									Cancel
								</Button>
								<Button
									size="sm"
									variant="primary"
									onClick={handleSubmit}
									disabled={!name().trim() || isSubmitting()}
								>
									{isSubmitting() ? "Submitting..." : "Submit Suggestion"}
								</Button>
							</Flex>
							<Text size="xs" color="muted">
								Suggestions need 3 community votes to be approved.
							</Text>
						</Stack>
					</Show>
				</Show>

				<Show when={(pendingSuggestions()?.length ?? 0) > 0}>
					<Stack spacing="sm">
						<Text size="sm" weight="medium">
							Pending Ecosystem Suggestions ({pendingSuggestions()?.length})
						</Text>
						<Stack spacing="xs">
							<For each={pendingSuggestions()}>
								{(suggestion) => {
									const counts = () => getVoteCounts(suggestion.votes);
									const voted = () => hasVoted(suggestion.votes);
									const isOwn = () => suggestion.accountId === currentUserId();
									const payload = () =>
										suggestion.payload as {
											name?: string;
											description?: string;
										};

									return (
										<div class="flex items-center justify-between p-3 border border-outline dark:border-outline-dark rounded-radius">
											<div>
												<Flex gap="xs" align="center">
													<Badge variant="info" size="sm">
														{getSuggestionTypeLabel(suggestion.type)}
													</Badge>
													<Text size="sm" weight="medium">
														{payload().name ??
															formatSuggestionDescription(
																suggestion.type,
																suggestion.payload,
																{},
															)}
													</Text>
												</Flex>
												<Show when={payload().description}>
													<Text size="xs" color="muted" class="mt-1">
														{payload().description}
													</Text>
												</Show>
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
					</Stack>
				</Show>
			</Stack>
		</Card>
	);
};

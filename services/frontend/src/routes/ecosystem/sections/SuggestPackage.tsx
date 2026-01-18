import {
	formatSuggestionDescription,
	getSuggestionTypeLabel,
	mutators,
	queries,
	useQuery,
	useZero,
} from "@package/database/client";
import { createMemo, createSignal, For, Show } from "solid-js";
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

interface SuggestPackageProps {
	ecosystemId: string;
	existingPackageIds: Set<string>;
}

export const SuggestPackage = (props: SuggestPackageProps) => {
	const zero = useZero();
	const isLoggedIn = () => zero().userID !== "anon";
	const currentUserId = () => zero().userID;

	const [searchQuery, setSearchQuery] = createSignal("");
	const [showSearch, setShowSearch] = createSignal(false);

	const [searchResults] = useQuery(() =>
		queries.packages.search({
			query: searchQuery() || undefined,
			limit: 10,
		}),
	);

	const [pendingSuggestions] = useQuery(() =>
		queries.suggestions.pendingForEcosystem({ ecosystemId: props.ecosystemId }),
	);

	const pendingPackageIds = createMemo(() => {
		const suggestions = pendingSuggestions() ?? [];
		return new Set(
			suggestions
				.filter((s) => s.type === "add_ecosystem_package")
				.map((s) => (s.payload as { packageId?: string })?.packageId)
				.filter(Boolean) as string[],
		);
	});

	const availablePackages = createMemo(() => {
		const results = searchResults() ?? [];
		const existing = props.existingPackageIds;
		const pending = pendingPackageIds();

		return results.filter(
			(pkg) => !existing.has(pkg.id) && !pending.has(pkg.id),
		);
	});

	const packagesById = createMemo(() => {
		const results = searchResults() ?? [];
		return new Map(results.map((p) => [p.id, p]));
	});

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

	const handleSuggestPackage = (packageId: string) => {
		try {
			zero().mutate(
				mutators.suggestions.createAddEcosystemPackage({
					ecosystemId: props.ecosystemId,
					packageId,
				}),
			);
			setSearchQuery("");
			setShowSearch(false);
			toast.success(
				"Your package suggestion is now pending review.",
				"Suggestion submitted",
			);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Unknown error",
				"Failed to submit",
			);
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
					<Text weight="semibold">Suggest Package for Ecosystem</Text>
					<Show when={isLoggedIn() && !showSearch()}>
						<Button
							size="sm"
							variant="primary"
							onClick={() => setShowSearch(true)}
						>
							Suggest Package
						</Button>
					</Show>
				</Flex>

				<Show
					when={isLoggedIn()}
					fallback={
						<Text size="sm" color="muted">
							Sign in to suggest packages for this ecosystem.
						</Text>
					}
				>
					<Show when={showSearch()}>
						<Stack spacing="sm">
							<TextField>
								<TextFieldLabel>Search Packages</TextFieldLabel>
								<TextFieldInput
									placeholder="Search for a package to add..."
									value={searchQuery()}
									onInput={(e) => setSearchQuery(e.currentTarget.value)}
								/>
							</TextField>

							<Show when={searchQuery().length > 0}>
								<Show
									when={availablePackages().length > 0}
									fallback={
										<Text size="sm" color="muted">
											No matching packages found (or already added/pending).
										</Text>
									}
								>
									<Stack spacing="xs">
										<For each={availablePackages()}>
											{(pkg) => (
												<div class="flex items-center justify-between p-2 border border-outline dark:border-outline-dark rounded-radius hover:bg-accent/5">
													<div>
														<Flex gap="xs" align="center">
															<Text size="sm" weight="medium">
																{pkg.name}
															</Text>
															<Badge variant="secondary" size="sm">
																{pkg.registry}
															</Badge>
														</Flex>
														<Show when={pkg.description}>
															<Text
																size="xs"
																color="muted"
																class="line-clamp-1"
															>
																{pkg.description}
															</Text>
														</Show>
													</div>
													<Button
														size="sm"
														variant="outline"
														onClick={() => handleSuggestPackage(pkg.id)}
													>
														Suggest
													</Button>
												</div>
											)}
										</For>
									</Stack>
								</Show>
							</Show>

							<Flex gap="sm" justify="end">
								<Button
									size="sm"
									variant="outline"
									onClick={() => {
										setShowSearch(false);
										setSearchQuery("");
									}}
								>
									Cancel
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
							Pending Package Suggestions ({pendingSuggestions()?.length})
						</Text>
						<Stack spacing="xs">
							<For each={pendingSuggestions()}>
								{(suggestion) => {
									const counts = () => getVoteCounts(suggestion.votes);
									const voted = () => hasVoted(suggestion.votes);
									const isOwn = () => suggestion.accountId === currentUserId();
									const pkg = () =>
										suggestion.package ??
										packagesById().get(
											(suggestion.payload as { packageId?: string })
												?.packageId ?? "",
										);

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

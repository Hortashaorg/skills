import { type SuggestionDisplay, useZero } from "@package/database/client";
import { A } from "@solidjs/router";
import type { Accessor } from "solid-js";
import { For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getDisplayName } from "@/lib/account";

export interface BacklogSuggestion {
	id: string;
	type: string;
	version: number;
	payload: unknown;
	accountId: string;
	account?: { name: string | null; deletedAt?: Date | number | null } | null;
	votes?: readonly { accountId: string; vote: string }[];
}

interface BacklogProps {
	suggestions: Accessor<readonly BacklogSuggestion[] | undefined>;
	currentSuggestionId: Accessor<string | undefined>;
	displayMap: Accessor<Record<string, SuggestionDisplay> | undefined>;
	onSelect: (id: string) => void;
}

export const Backlog = (props: BacklogProps) => {
	const zero = useZero();
	const currentUserId = () => zero().userID;

	return (
		<Show when={props.suggestions()?.length}>
			<Card padding="md" class="mt-4">
				<Stack spacing="sm">
					<Flex justify="between" align="center">
						<Heading level="h4">
							All Pending ({props.suggestions()?.length ?? 0})
						</Heading>
					</Flex>
					<div class="max-h-64 overflow-y-auto space-y-2">
						<For each={props.suggestions()}>
							{(suggestion) => {
								const isOwn = () => suggestion.accountId === currentUserId();
								const isCurrent = () =>
									suggestion.id === props.currentSuggestionId();
								const hasVoted = () =>
									(suggestion.votes ?? []).some(
										(v) => v.accountId === currentUserId(),
									);
								return (
									<button
										type="button"
										onClick={() => props.onSelect(suggestion.id)}
										class="w-full text-left p-2 rounded text-sm border border-outline dark:border-outline-dark hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition-colors"
										classList={{
											"bg-primary/10 dark:bg-primary-dark/10 border-primary dark:border-primary-dark":
												isCurrent(),
										}}
									>
										<Flex justify="between" align="start" gap="sm">
											<Stack spacing="xs" class="flex-1 min-w-0">
												<Flex gap="xs" align="center" wrap="wrap">
													<Show
														when={
															props.displayMap()?.[suggestion.id]?.actionEntity
														}
														fallback={
															<Text
																size="sm"
																weight={isCurrent() ? "semibold" : "normal"}
																class="truncate"
															>
																{props.displayMap()?.[suggestion.id]?.action ??
																	suggestion.type.replace(/_/g, " ")}
															</Text>
														}
													>
														{(entity) => (
															<>
																<Text
																	size="sm"
																	weight={isCurrent() ? "semibold" : "normal"}
																	class="shrink-0"
																>
																	{props.displayMap()?.[suggestion.id]
																		?.actionLabel ?? "Suggestion"}
																</Text>
																<A
																	href={entity().href}
																	class="text-sm font-medium hover:text-primary dark:hover:text-primary-dark truncate underline decoration-dotted underline-offset-2"
																	onClick={(e) => e.stopPropagation()}
																>
																	{entity().label}
																</A>
															</>
														)}
													</Show>
													<Show
														when={props.displayMap()?.[suggestion.id]?.target}
													>
														<Text size="xs" color="muted">
															on
														</Text>
														<A
															href={
																props.displayMap()?.[suggestion.id]?.target
																	?.href ?? ""
															}
															class="text-xs font-medium hover:text-primary dark:hover:text-primary-dark truncate"
															onClick={(e) => e.stopPropagation()}
														>
															{
																props.displayMap()?.[suggestion.id]?.target
																	?.label
															}
														</A>
														<Show
															when={
																props.displayMap()?.[suggestion.id]?.target
																	?.sublabel
															}
														>
															<Text size="xs" color="muted">
																(
																{
																	props.displayMap()?.[suggestion.id]?.target
																		?.sublabel
																}
																)
															</Text>
														</Show>
													</Show>
												</Flex>
												<Flex gap="xs" align="center">
													<Text size="xs" color="muted">
														by{" "}
														<A
															href={`/user/${suggestion.accountId}`}
															class="hover:text-brand dark:hover:text-brand-dark transition-colors"
														>
															{getDisplayName(suggestion.account)}
														</A>
													</Text>
													<Show when={isOwn()}>
														<Badge variant="warning" size="sm">
															yours
														</Badge>
													</Show>
													<Show when={hasVoted()}>
														<Badge variant="secondary" size="sm">
															voted
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
									</button>
								);
							}}
						</For>
					</div>
				</Stack>
			</Card>
		</Show>
	);
};

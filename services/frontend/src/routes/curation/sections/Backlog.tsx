import { useZero } from "@package/database/client";
import type { Accessor } from "solid-js";
import { For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface BacklogSuggestion {
	id: string;
	type: string;
	payload: unknown;
	accountId: string;
	account?: { name: string | null } | null;
	package?: { name: string | null } | null;
	votes?: readonly { accountId: string; vote: string }[];
}

interface BacklogProps {
	suggestions: Accessor<readonly BacklogSuggestion[] | undefined>;
	currentSuggestionId: Accessor<string | undefined>;
	getTagName: (payload: unknown) => string;
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
													<Text
														size="sm"
														weight={isCurrent() ? "semibold" : "normal"}
														class="truncate"
													>
														{props.getTagName(suggestion.payload)}
													</Text>
													<Text size="xs" color="muted">
														→
													</Text>
													<Text size="xs" color="muted" class="truncate">
														{suggestion.package?.name}
													</Text>
												</Flex>
												<Flex gap="xs" align="center">
													<Text size="xs" color="muted">
														by {suggestion.account?.name ?? "Unknown"}
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

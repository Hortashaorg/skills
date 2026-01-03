import { A } from "@solidjs/router";
import type { Accessor } from "solid-js";
import { Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildPackageUrl } from "@/lib/url";

export interface ReviewQueueSuggestion {
	id: string;
	type: string;
	payload: unknown;
	accountId: string;
	account?: { name: string | null } | null;
	package?: {
		name: string | null;
		registry: string | null;
		description: string | null;
	} | null;
	votes?: readonly { accountId: string; vote: string }[];
}

interface ReviewQueueProps {
	suggestion: Accessor<ReviewQueueSuggestion | null>;
	isOwnSuggestion: Accessor<boolean>;
	isAdmin: Accessor<boolean>;
	hasVoted: Accessor<boolean>;
	voteCounts: Accessor<{ approve: number; reject: number }>;
	getTagName: (payload: unknown) => string;
	onVote: (vote: "approve" | "reject") => void;
}

export const ReviewQueue = (props: ReviewQueueProps) => {
	return (
		<Card padding="lg">
			<Stack spacing="md">
				<Heading level="h3">Review Queue</Heading>

				<Show
					when={props.suggestion()}
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
							<div class="p-4 bg-surface-alt dark:bg-surface-dark-alt rounded-radius">
								<Stack spacing="sm">
									<Show when={props.isOwnSuggestion() && props.isAdmin()}>
										<Badge variant="warning" size="sm">
											Your suggestion
										</Badge>
									</Show>
									<Text size="lg" weight="semibold">
										Add tag "{props.getTagName(suggestion().payload)}"
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
										<Text size="xs" color="muted" class="line-clamp-2">
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
													+{props.voteCounts().approve}
												</Badge>
												<Badge variant="danger" size="sm">
													-{props.voteCounts().reject}
												</Badge>
											</Flex>
										</Flex>
									</div>
								</Stack>
							</div>

							<Show
								when={!props.hasVoted()}
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
										onClick={() => props.onVote("approve")}
									>
										Approve
									</Button>
									<Button
										size="lg"
										variant="outline"
										onClick={() => props.onVote("reject")}
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
	);
};

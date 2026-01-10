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
import { Skeleton } from "@/components/ui/skeleton";
import { getDisplayName } from "@/lib/account";
import { buildPackageUrl } from "@/lib/url";

export interface ReviewQueueSuggestion {
	id: string;
	type: string;
	payload: unknown;
	accountId: string;
	account?: { name: string | null; deletedAt?: Date | number | null } | null;
	package?: {
		name: string | null;
		registry: string | null;
		description: string | null;
	} | null;
	votes?: readonly { accountId: string; vote: string }[];
}

interface ReviewQueueProps {
	suggestion: Accessor<ReviewQueueSuggestion | null>;
	isLoading: Accessor<boolean>;
	isOwnSuggestion: Accessor<boolean>;
	isAdmin: Accessor<boolean>;
	hasVoted: Accessor<boolean>;
	voteCounts: Accessor<{ approve: number; reject: number }>;
	isSkipped: Accessor<boolean>;
	formatAction: (type: string, payload: unknown) => string;
	onVote: (vote: "approve" | "reject") => void;
	onSkip: () => void;
}

const ReviewQueueSkeleton = () => (
	<div class="p-4 bg-surface-alt dark:bg-surface-dark-alt rounded-radius">
		<Stack spacing="sm">
			<Skeleton width="60%" height="24px" />
			<Flex gap="xs" align="center">
				<Skeleton width="20px" height="16px" />
				<Skeleton width="120px" height="16px" />
				<Skeleton width="40px" height="16px" />
			</Flex>
			<Skeleton width="100%" height="32px" />
			<div class="pt-2 border-t border-outline/50 dark:border-outline-dark/50">
				<Flex gap="md" align="center">
					<Skeleton width="80px" height="14px" />
					<Flex gap="xs">
						<Skeleton width="32px" height="20px" />
						<Skeleton width="32px" height="20px" />
					</Flex>
				</Flex>
			</div>
		</Stack>
	</div>
);

export const ReviewQueue = (props: ReviewQueueProps) => {
	return (
		<Card padding="lg">
			<Stack spacing="md">
				<Heading level="h3">Review Queue</Heading>

				<Show when={props.isLoading()}>
					<ReviewQueueSkeleton />
				</Show>

				<Show when={!props.isLoading() && !props.suggestion()}>
					<Stack spacing="sm" align="center" class="py-8">
						<Text color="muted">No suggestions to review</Text>
						<Text size="sm" color="muted">
							Check back later or suggest tags on package pages.
						</Text>
					</Stack>
				</Show>

				<Show when={!props.isLoading() && props.suggestion()}>
					{(suggestion) => (
						<Stack spacing="md">
							<div class="p-4 bg-surface-alt dark:bg-surface-dark-alt rounded-radius">
								<Stack spacing="sm">
									<Flex gap="xs">
										<Show when={props.isOwnSuggestion() && props.isAdmin()}>
											<Badge variant="warning" size="sm">
												Your suggestion
											</Badge>
										</Show>
										<Show when={props.isSkipped()}>
											<Badge variant="info" size="sm">
												Skipped
											</Badge>
										</Show>
									</Flex>
									<Text size="lg" weight="semibold">
										{props.formatAction(
											suggestion().type,
											suggestion().payload,
										)}
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
												by {getDisplayName(suggestion().account)}
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
									<Button size="lg" variant="secondary" onClick={props.onSkip}>
										Skip
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

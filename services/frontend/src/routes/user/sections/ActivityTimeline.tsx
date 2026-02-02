import { formatCompactDateTime } from "@package/common";
import type { Row } from "@package/database/client";
import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { CheckIcon, TrophyIcon, XIcon } from "@/components/primitives/icon";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { buildPackageUrl } from "@/lib/url";

type ContributionEvent = Row["contributionEvents"] & {
	suggestion?:
		| (Row["suggestions"] & {
				package?: Row["packages"] | null;
				ecosystem?: Row["ecosystems"] | null;
		  })
		| null;
};

interface ActivityTimelineProps {
	events: readonly ContributionEvent[];
}

const EventIcon = (props: { type: string }) => {
	switch (props.type) {
		case "suggestion_approved":
			return (
				<CheckIcon size="sm" class="text-success dark:text-success-dark" />
			);
		case "suggestion_rejected":
			return <XIcon size="sm" class="text-danger dark:text-danger-dark" />;
		case "vote_matched":
			return <TrophyIcon size="sm" class="text-brand dark:text-brand-dark" />;
		default:
			return <CheckIcon size="sm" class="text-muted dark:text-muted-dark" />;
	}
};

const getEventDescription = (event: ContributionEvent): string => {
	switch (event.type) {
		case "suggestion_approved":
			return "Suggestion approved";
		case "suggestion_rejected":
			return "Suggestion rejected";
		case "vote_matched":
			return "Vote matched outcome";
		default:
			return "Contribution";
	}
};

const EventTarget = (props: {
	suggestion: ContributionEvent["suggestion"];
}) => {
	const pkg = () => props.suggestion?.package;
	const eco = () => props.suggestion?.ecosystem;

	return (
		<Show when={pkg() || eco()}>
			<Show when={pkg()}>
				{(p) => (
					<A
						href={buildPackageUrl(p().registry, p().name)}
						class="text-brand dark:text-brand-dark hover:underline"
					>
						{p().name}
					</A>
				)}
			</Show>
			<Show when={!pkg() && eco()}>
				{(e) => (
					<A
						href={`/ecosystem/${e().slug}`}
						class="text-brand dark:text-brand-dark hover:underline"
					>
						{e().name}
					</A>
				)}
			</Show>
		</Show>
	);
};

export const ActivityTimeline = (props: ActivityTimelineProps) => {
	return (
		<Stack spacing="sm">
			<Text weight="semibold">Recent Activity</Text>
			<Show
				when={props.events.length > 0}
				fallback={
					<Text size="sm" color="muted" class="py-4">
						No activity yet
					</Text>
				}
			>
				<Stack spacing="xs">
					<For each={props.events}>
						{(event) => (
							<Flex
								gap="sm"
								align="center"
								class="py-2 px-3 rounded-radius hover:bg-surface-alt dark:hover:bg-surface-dark-alt"
							>
								<EventIcon type={event.type} />
								<Flex gap="xs" align="center" class="flex-1 min-w-0 flex-wrap">
									<Text size="sm">{getEventDescription(event)}</Text>
									<EventTarget suggestion={event.suggestion} />
								</Flex>
								<Flex gap="sm" align="center" class="shrink-0">
									<Text
										size="sm"
										weight="medium"
										class={
											event.points > 0
												? "text-success dark:text-success-dark"
												: "text-danger dark:text-danger-dark"
										}
									>
										{event.points > 0 ? "+" : ""}
										{event.points}
									</Text>
									<Text size="xs" color="muted" class="hidden sm:block">
										{formatCompactDateTime(event.createdAt)}
									</Text>
								</Flex>
							</Flex>
						)}
					</For>
				</Stack>
			</Show>
		</Stack>
	);
};

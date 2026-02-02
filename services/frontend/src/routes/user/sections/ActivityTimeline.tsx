import { formatCompactDateTime } from "@package/common";
import type { Row } from "@package/database/client";
import { A } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import {
	CheckIcon,
	DocumentIcon,
	TrophyIcon,
	XIcon,
} from "@/components/primitives/icon";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Tabs } from "@/components/ui/tabs";
import { buildPackageUrl } from "@/lib/url";

type ContributionEvent = Row["contributionEvents"] & {
	suggestion?:
		| (Row["suggestions"] & {
				package?: Row["packages"] | null;
				ecosystem?: Row["ecosystems"] | null;
		  })
		| null;
};

type Comment = Row["comments"] & {
	thread?:
		| (Row["threads"] & {
				package?: Row["packages"] | null;
				ecosystem?: Row["ecosystems"] | null;
				project?: Row["projects"] | null;
		  })
		| null;
};

interface ActivityTimelineProps {
	events: readonly ContributionEvent[];
	comments: readonly Comment[];
}

type ActivityTab = "all" | "contributions" | "comments";

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

const CommentLink = (props: { comment: Comment }) => {
	const thread = () => props.comment.thread;
	const pkg = () => thread()?.package;
	const eco = () => thread()?.ecosystem;
	const proj = () => thread()?.project;

	const commentHref = () => {
		const id = props.comment.id;
		const p = pkg();
		const e = eco();
		const pr = proj();
		if (p)
			return `${buildPackageUrl(p.registry, p.name)}/discussion#comment-${id}`;
		if (e) return `/ecosystem/${e.slug}/discussion#comment-${id}`;
		if (pr) return `/projects/${pr.id}#comment-${id}`;
		return "#";
	};

	return (
		<Flex gap="xs" align="center" class="flex-wrap">
			<A
				href={commentHref()}
				class="text-brand dark:text-brand-dark hover:underline"
			>
				<Text size="sm">Comment</Text>
			</A>
			<Show when={pkg()}>
				{(p) => (
					<>
						<Text size="sm" color="muted">
							on Package
						</Text>
						<A
							href={buildPackageUrl(p().registry, p().name)}
							class="text-brand dark:text-brand-dark hover:underline"
						>
							<Text size="sm">{p().name}</Text>
						</A>
					</>
				)}
			</Show>
			<Show when={!pkg() && eco()}>
				{(e) => (
					<>
						<Text size="sm" color="muted">
							on Ecosystem
						</Text>
						<A
							href={`/ecosystem/${e().slug}`}
							class="text-brand dark:text-brand-dark hover:underline"
						>
							<Text size="sm">{e().name}</Text>
						</A>
					</>
				)}
			</Show>
			<Show when={!pkg() && !eco() && proj()}>
				{(p) => (
					<>
						<Text size="sm" color="muted">
							on Project
						</Text>
						<A
							href={`/projects/${p().id}`}
							class="text-brand dark:text-brand-dark hover:underline"
						>
							<Text size="sm">{p().name}</Text>
						</A>
					</>
				)}
			</Show>
		</Flex>
	);
};

type ActivityItem =
	| { type: "event"; data: ContributionEvent; createdAt: number }
	| { type: "comment"; data: Comment; createdAt: number };

export const ActivityTimeline = (props: ActivityTimelineProps) => {
	const [tab, setTab] = createSignal<ActivityTab>("all");

	const allItems = (): ActivityItem[] => {
		const eventItems: ActivityItem[] = props.events.map((e) => ({
			type: "event",
			data: e,
			createdAt: e.createdAt,
		}));
		const commentItems: ActivityItem[] = props.comments.map((c) => ({
			type: "comment",
			data: c,
			createdAt: c.createdAt,
		}));
		return [...eventItems, ...commentItems].sort(
			(a, b) => b.createdAt - a.createdAt,
		);
	};

	const filteredItems = () => {
		const currentTab = tab();
		if (currentTab === "all") return allItems().slice(0, 20);
		if (currentTab === "contributions")
			return allItems()
				.filter((i) => i.type === "event")
				.slice(0, 20);
		return allItems()
			.filter((i) => i.type === "comment")
			.slice(0, 20);
	};

	const hasAnyActivity = () =>
		props.events.length > 0 || props.comments.length > 0;

	return (
		<Stack spacing="sm">
			<Flex justify="between" align="center">
				<Text weight="semibold">Recent Activity</Text>
			</Flex>

			<Show when={hasAnyActivity()}>
				<Tabs.Root value={tab()} onChange={(v) => setTab(v as ActivityTab)}>
					<Tabs.List>
						<Tabs.Trigger value="all">All</Tabs.Trigger>
						<Tabs.Trigger value="contributions">
							Votes & Suggestions
						</Tabs.Trigger>
						<Tabs.Trigger value="comments">Comments</Tabs.Trigger>
					</Tabs.List>
				</Tabs.Root>
			</Show>

			<Show
				when={filteredItems().length > 0}
				fallback={
					<Text size="sm" color="muted" class="py-4">
						No activity yet
					</Text>
				}
			>
				<Stack spacing="xs">
					<For each={filteredItems()}>
						{(item) => (
							<Show
								when={item.type === "event"}
								fallback={
									<Flex
										gap="sm"
										align="center"
										class="py-2 px-3 rounded-radius hover:bg-surface-alt dark:hover:bg-surface-dark-alt"
									>
										<DocumentIcon
											size="sm"
											class="text-muted dark:text-muted-dark shrink-0"
										/>
										<div class="flex-1 min-w-0">
											<CommentLink comment={item.data as Comment} />
										</div>
										<Text
											size="xs"
											color="muted"
											class="shrink-0 hidden sm:block"
										>
											{formatCompactDateTime(item.createdAt)}
										</Text>
									</Flex>
								}
							>
								<Flex
									gap="sm"
									align="center"
									class="py-2 px-3 rounded-radius hover:bg-surface-alt dark:hover:bg-surface-dark-alt"
								>
									<EventIcon type={(item.data as ContributionEvent).type} />
									<Flex
										gap="xs"
										align="center"
										class="flex-1 min-w-0 flex-wrap"
									>
										<Text size="sm">
											{getEventDescription(item.data as ContributionEvent)}
										</Text>
										<EventTarget
											suggestion={(item.data as ContributionEvent).suggestion}
										/>
									</Flex>
									<Flex gap="sm" align="center" class="shrink-0">
										<Text
											size="sm"
											weight="medium"
											class={
												(item.data as ContributionEvent).points > 0
													? "text-success dark:text-success-dark"
													: "text-danger dark:text-danger-dark"
											}
										>
											{(item.data as ContributionEvent).points > 0 ? "+" : ""}
											{(item.data as ContributionEvent).points}
										</Text>
										<Text size="xs" color="muted" class="hidden sm:block">
											{formatCompactDateTime(item.createdAt)}
										</Text>
									</Flex>
								</Flex>
							</Show>
						)}
					</For>
				</Stack>
			</Show>
		</Stack>
	);
};

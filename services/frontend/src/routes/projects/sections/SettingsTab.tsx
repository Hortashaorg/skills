import { createMemo, createSignal, For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Input } from "@/components/primitives/input";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUserSearch } from "@/hooks/users/useUserSearch";
import { getDisplayName } from "@/lib/account";

interface Member {
	id: string;
	accountId: string;
	role: string;
	account?: { name?: string | null } | null;
}

export interface SettingsTabProps {
	members: readonly Member[];
	isOwner: boolean;
	currentUserId: string;
	onAddMember: (accountId: string) => void;
	onRemoveMember: (memberId: string) => void;
}

function getInitials(name: string | null | undefined): string {
	if (!name) return "?";
	return name.charAt(0).toUpperCase();
}

export const SettingsTab = (props: SettingsTabProps) => {
	const [showSearch, setShowSearch] = createSignal(false);
	const userSearch = useUserSearch({
		showRecentWhenEmpty: true,
		sortBy: "createdAt",
	});

	const memberAccountIds = () => new Set(props.members.map((m) => m.accountId));

	const searchResults = createMemo(() => {
		const exact = userSearch.exactMatch();
		const results = userSearch.results();
		const ids = memberAccountIds();

		const combined = exact
			? [exact, ...results.filter((u) => u.id !== exact.id)]
			: [...results];

		return combined.filter((u) => !ids.has(u.id));
	});

	const handleAdd = (accountId: string) => {
		props.onAddMember(accountId);
		userSearch.setQuery("");
		setShowSearch(false);
	};

	return (
		<Stack spacing="lg">
			<Card padding="lg">
				<Stack spacing="md">
					<Flex justify="between" align="center">
						<Heading level="h3">Members</Heading>
						<Show when={props.isOwner && !showSearch()}>
							<Button
								variant="secondary"
								size="sm"
								onClick={() => setShowSearch(true)}
							>
								Add member
							</Button>
						</Show>
					</Flex>

					<Show when={showSearch()}>
						<Card padding="md" class="border-primary dark:border-primary-dark">
							<Stack spacing="sm">
								<Input
									value={userSearch.query()}
									onInput={(e) => userSearch.setQuery(e.currentTarget.value)}
									placeholder="Search users by name..."
									size="sm"
								/>
								<Show when={userSearch.query().trim()}>
									<Stack spacing="xs">
										<For
											each={searchResults()}
											fallback={
												<Text color="muted" size="sm">
													No users found
												</Text>
											}
										>
											{(user) => (
												<button
													type="button"
													onClick={() => handleAdd(user.id)}
													class="flex items-center gap-2 w-full rounded-radius px-2 py-1.5 text-left transition hover:bg-surface-raised dark:hover:bg-surface-dark-raised"
												>
													<Avatar
														size="sm"
														variant="primary"
														initials={getInitials(user.name)}
													/>
													<Text size="sm" class="flex-1">
														{getDisplayName(user)}
													</Text>
													<Badge variant="secondary" size="sm">
														contributor
													</Badge>
												</button>
											)}
										</For>
									</Stack>
								</Show>
								<Flex justify="end">
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setShowSearch(false);
											userSearch.setQuery("");
										}}
									>
										Cancel
									</Button>
								</Flex>
							</Stack>
						</Card>
					</Show>

					<Stack spacing="xs">
						<For each={props.members}>
							{(member) => (
								<Flex align="center" gap="sm" class="rounded-radius px-3 py-2">
									<Avatar
										size="sm"
										variant={member.role === "owner" ? "primary" : "secondary"}
										initials={getInitials(member.account?.name)}
									/>
									<Text size="sm" class="flex-1">
										{getDisplayName(member.account)}
									</Text>
									<Badge
										variant={member.role === "owner" ? "primary" : "secondary"}
										size="sm"
									>
										{member.role}
									</Badge>
									<Show
										when={
											props.isOwner && member.accountId !== props.currentUserId
										}
									>
										<Button
											variant="danger"
											size="sm"
											onClick={() => props.onRemoveMember(member.id)}
										>
											Remove
										</Button>
									</Show>
								</Flex>
							)}
						</For>
					</Stack>
				</Stack>
			</Card>
		</Stack>
	);
};

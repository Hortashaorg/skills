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

type Role = "owner" | "contributor";

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
	onAddMember: (accountId: string, role: Role) => void;
	onUpdateRole: (memberId: string, role: Role) => void;
	onRemoveMember: (memberId: string) => void;
}

function getInitials(name: string | null | undefined): string {
	if (!name) return "?";
	return name.charAt(0).toUpperCase();
}

export const SettingsTab = (props: SettingsTabProps) => {
	const [showSearch, setShowSearch] = createSignal(false);
	const [addRole, setAddRole] = createSignal<Role>("contributor");
	const userSearch = useUserSearch({
		showRecentWhenEmpty: true,
		sortBy: "createdAt",
	});

	const memberAccountIds = () => new Set(props.members.map((m) => m.accountId));

	const filteredExactMatch = createMemo(() => {
		const exact = userSearch.exactMatch();
		if (!exact) return null;
		if (memberAccountIds().has(exact.id)) return null;
		return exact;
	});

	const filteredResults = createMemo(() => {
		const results = userSearch.results();
		const ids = memberAccountIds();
		const exactId = filteredExactMatch()?.id;
		return results.filter((u) => !ids.has(u.id) && u.id !== exactId);
	});

	const handleAdd = (accountId: string) => {
		props.onAddMember(accountId, addRole());
		userSearch.setQuery("");
		setShowSearch(false);
		setAddRole("contributor");
	};

	const toggleRole = (member: Member) => {
		const newRole: Role = member.role === "owner" ? "contributor" : "owner";
		props.onUpdateRole(member.id, newRole);
	};

	return (
		<Stack spacing="lg">
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
							<Flex gap="sm" align="center">
								<Input
									value={userSearch.query()}
									onInput={(e) => userSearch.setQuery(e.currentTarget.value)}
									placeholder="Search users by name..."
									size="sm"
									class="flex-1"
								/>
								<Flex gap="xs" align="center">
									<button
										type="button"
										onClick={() => setAddRole("contributor")}
										class={`px-2 py-1 text-xs rounded-radius border transition ${
											addRole() === "contributor"
												? "bg-secondary text-on-secondary border-secondary dark:bg-secondary-dark dark:text-on-secondary-dark dark:border-secondary-dark"
												: "border-outline text-on-surface-muted dark:border-outline-dark dark:text-on-surface-dark-muted"
										}`}
									>
										contributor
									</button>
									<button
										type="button"
										onClick={() => setAddRole("owner")}
										class={`px-2 py-1 text-xs rounded-radius border transition ${
											addRole() === "owner"
												? "bg-primary text-on-primary border-primary dark:bg-primary-dark dark:text-on-primary-dark dark:border-primary-dark"
												: "border-outline text-on-surface-muted dark:border-outline-dark dark:text-on-surface-dark-muted"
										}`}
									>
										owner
									</button>
								</Flex>
							</Flex>
							<Show when={userSearch.query().trim()}>
								<Stack spacing="xs">
									<Show when={filteredExactMatch()}>
										{(user) => (
											<button
												type="button"
												onClick={() => handleAdd(user().id)}
												class="flex items-center gap-2 w-full rounded-radius px-2 py-1.5 text-left transition hover:bg-surface-raised dark:hover:bg-surface-dark-raised"
											>
												<Avatar
													size="sm"
													variant="primary"
													initials={getInitials(user().name)}
												/>
												<Text size="sm" class="flex-1">
													{getDisplayName(user())}
												</Text>
												<Badge variant="info" size="sm">
													Exact match
												</Badge>
											</button>
										)}
									</Show>
									<For
										each={filteredResults()}
										fallback={
											<Show when={!filteredExactMatch()}>
												<Text color="muted" size="sm">
													No users found
												</Text>
											</Show>
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
										setAddRole("contributor");
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
								<Show
									when={
										props.isOwner && member.accountId !== props.currentUserId
									}
									fallback={
										<Badge
											variant={
												member.role === "owner" ? "primary" : "secondary"
											}
											size="sm"
										>
											{member.role}
										</Badge>
									}
								>
									<button
										type="button"
										onClick={() => toggleRole(member)}
										class="cursor-pointer"
									>
										<Badge
											variant={
												member.role === "owner" ? "primary" : "secondary"
											}
											size="sm"
										>
											{member.role}
										</Badge>
									</button>
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
		</Stack>
	);
};

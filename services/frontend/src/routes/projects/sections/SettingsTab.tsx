import { createMemo, createSignal, For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { ChevronDownIcon } from "@/components/primitives/icon";
import { Input } from "@/components/primitives/input";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dropdown } from "@/components/ui/dropdown";
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
	const [removeTarget, setRemoveTarget] = createSignal<{
		id: string;
		name: string;
	} | null>(null);

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
		props.onAddMember(accountId, "contributor");
		userSearch.setQuery("");
		setShowSearch(false);
	};

	const confirmRemove = () => {
		const target = removeTarget();
		if (target) {
			props.onRemoveMember(target.id);
			setRemoveTarget(null);
		}
	};

	const ownerCount = () =>
		props.members.filter((m) => m.role === "owner").length;

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
							<Input
								value={userSearch.query()}
								onInput={(e) => userSearch.setQuery(e.currentTarget.value)}
								placeholder="Search users by name..."
								size="sm"
							/>
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
									}}
								>
									Cancel
								</Button>
							</Flex>
						</Stack>
					</Card>
				</Show>

				<Text color="muted" size="sm">
					{props.members.length}{" "}
					{props.members.length === 1 ? "member" : "members"}
				</Text>

				<Stack spacing="xs">
					<For each={props.members}>
						{(member) => {
							const isSelf = () => member.accountId === props.currentUserId;
							const isOnlyOwner = () =>
								member.role === "owner" && ownerCount() <= 1;
							const oppositeRole = (): Role =>
								member.role === "owner" ? "contributor" : "owner";

							return (
								<Flex
									align="center"
									gap="sm"
									class="rounded-radius px-3 py-2 transition hover:bg-surface-raised dark:hover:bg-surface-dark-raised"
								>
									<Avatar
										size="sm"
										variant={member.role === "owner" ? "primary" : "secondary"}
										initials={getInitials(member.account?.name)}
									/>
									<Stack spacing="none" class="flex-1 min-w-0">
										<Text size="sm">
											{getDisplayName(member.account)}
											<Show when={isSelf()}>
												<span class="text-on-surface-muted dark:text-on-surface-dark-muted">
													{" "}
													(you)
												</span>
											</Show>
										</Text>
									</Stack>

									<Show
										when={props.isOwner && !isSelf()}
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
										<Dropdown>
											<Dropdown.Trigger
												aria-label={`Actions for ${getDisplayName(member.account)}`}
											>
												<Flex align="center" gap="xs" class="cursor-pointer">
													<Badge
														variant={
															member.role === "owner" ? "primary" : "secondary"
														}
														size="sm"
													>
														{member.role}
													</Badge>
													<ChevronDownIcon
														size="xs"
														class="text-on-surface-muted dark:text-on-surface-dark-muted"
													/>
												</Flex>
											</Dropdown.Trigger>
											<Dropdown.Content width="sm">
												<Dropdown.GroupLabel>Role</Dropdown.GroupLabel>
												<Dropdown.Item
													onSelect={() =>
														props.onUpdateRole(member.id, oppositeRole())
													}
													disabled={isOnlyOwner()}
												>
													<Flex align="center" gap="sm">
														<Text size="sm">Make {oppositeRole()}</Text>
														<Show when={isOnlyOwner()}>
															<Text size="xs" color="muted">
																(last owner)
															</Text>
														</Show>
													</Flex>
												</Dropdown.Item>
												<Dropdown.Separator />
												<Dropdown.Item
													onSelect={() =>
														setRemoveTarget({
															id: member.id,
															name:
																getDisplayName(member.account) ?? "this member",
														})
													}
													class="text-danger dark:text-danger-dark"
												>
													Remove from project
												</Dropdown.Item>
											</Dropdown.Content>
										</Dropdown>
									</Show>
								</Flex>
							);
						}}
					</For>
				</Stack>
			</Stack>

			<AlertDialog
				open={!!removeTarget()}
				onOpenChange={(open) => {
					if (!open) setRemoveTarget(null);
				}}
				title="Remove member"
				description={`Are you sure you want to remove ${removeTarget()?.name} from this project? They will lose access immediately.`}
				confirmText="Remove"
				variant="danger"
				onConfirm={confirmRemove}
			/>
		</Stack>
	);
};

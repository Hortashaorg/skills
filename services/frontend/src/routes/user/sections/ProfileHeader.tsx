import { formatDate } from "@package/common";
import type { Row } from "@package/database/client";
import { A } from "@solidjs/router";
import { Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { UserIcon } from "@/components/primitives/icon";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { getDisplayName } from "@/lib/account";

interface ProfileHeaderProps {
	account: Row["account"];
	isOwnProfile: boolean;
}

export const ProfileHeader = (props: ProfileHeaderProps) => {
	const displayName = () => getDisplayName(props.account);
	const memberSince = () => formatDate(props.account.createdAt);
	const isDeleted = () => !!props.account.deletedAt;

	return (
		<Stack spacing="md">
			<Flex gap="md" align="center">
				<div class="p-4 rounded-full bg-surface-alt dark:bg-surface-dark-alt">
					<UserIcon size="xl" class="text-muted dark:text-muted-dark" />
				</div>
				<Stack spacing="xs">
					<Flex gap="sm" align="center">
						<Heading level="h1">{displayName()}</Heading>
						<Show when={isDeleted()}>
							<Badge variant="danger" size="sm">
								Deleted
							</Badge>
						</Show>
						<Show when={props.isOwnProfile && !isDeleted()}>
							<Badge variant="info" size="sm">
								You
							</Badge>
						</Show>
					</Flex>
					<Text size="sm" color="muted">
						Member since {memberSince()}
					</Text>
				</Stack>
			</Flex>
			<Show when={props.isOwnProfile && !isDeleted()}>
				<A
					href="/me"
					class="text-sm text-brand dark:text-brand-dark hover:underline"
				>
					Edit your profile →
				</A>
			</Show>
		</Stack>
	);
};

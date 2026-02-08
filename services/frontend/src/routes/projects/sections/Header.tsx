import { Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { UpvoteButton } from "@/components/ui/upvote-button";

export interface ProjectHeaderProps {
	name: string;
	description?: string | null;
	memberCount: number;
	upvoteCount: number;
	hasUpvoted: boolean;
	isLoggedIn: boolean;
	onUpvote: () => void;
}

export const Header = (props: ProjectHeaderProps) => {
	return (
		<Stack spacing="md">
			<Flex gap="sm" align="center" wrap="wrap" class="min-w-0">
				<Heading level="h1" class="min-w-0 truncate">
					{props.name}
				</Heading>
				<div class="shrink-0 ml-auto flex items-center gap-2">
					<UpvoteButton
						count={props.upvoteCount}
						isUpvoted={props.hasUpvoted}
						disabled={!props.isLoggedIn}
						onClick={props.onUpvote}
						size="md"
					/>
				</div>
			</Flex>

			<Show when={props.description}>
				<Text color="muted" class="line-clamp-3">
					{props.description}
				</Text>
			</Show>

			<Flex gap="sm" align="center">
				<Badge variant="secondary" size="sm">
					{props.memberCount} {props.memberCount === 1 ? "member" : "members"}
				</Badge>
			</Flex>
		</Stack>
	);
};

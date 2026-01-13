import { Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { PencilIcon } from "@/components/primitives/icon";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Button } from "@/components/ui/button";
import { getDisplayName } from "@/lib/account";

type ProjectHeaderProps = {
	project: {
		name: string;
		description?: string | null;
		account: { id: string; name: string | null } | null | undefined;
	};
	isOwner: boolean;
	onEdit: () => void;
	onDelete: () => void;
};

export const ProjectHeader = (props: ProjectHeaderProps) => {
	return (
		<Flex justify="between" align="start" gap="md">
			<Stack spacing="xs" class="flex-1">
				<Flex align="center" gap="sm">
					<Heading level="h1">{props.project.name}</Heading>
					<Show when={props.isOwner}>
						<button
							type="button"
							onClick={props.onEdit}
							class="text-on-surface-muted hover:text-on-surface dark:text-on-surface-dark-muted dark:hover:text-on-surface-dark transition p-1"
						>
							<PencilIcon size="sm" title="Edit project" />
						</button>
					</Show>
				</Flex>
				<Show
					when={props.project.description}
					fallback={
						<Show when={props.isOwner}>
							<button
								type="button"
								onClick={props.onEdit}
								class="text-on-surface-muted dark:text-on-surface-dark-muted hover:text-on-surface dark:hover:text-on-surface-dark transition text-sm"
							>
								+ Add description
							</button>
						</Show>
					}
				>
					<Text color="muted">{props.project.description}</Text>
				</Show>
				<Text size="sm" color="muted">
					Created by {getDisplayName(props.project.account)}
				</Text>
			</Stack>
			<Show when={props.isOwner}>
				<Button variant="danger" size="sm" onClick={props.onDelete}>
					Delete
				</Button>
			</Show>
		</Flex>
	);
};

import { createSignal, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { CheckIcon, PencilIcon, XIcon } from "@/components/primitives/icon";
import { Input } from "@/components/primitives/input";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Textarea } from "@/components/primitives/textarea";
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
	canEdit?: boolean;
	onSave?: (name: string, description: string) => void;
}

export const Header = (props: ProjectHeaderProps) => {
	const [editing, setEditing] = createSignal(false);
	const [editName, setEditName] = createSignal("");
	const [editDescription, setEditDescription] = createSignal("");

	const startEditing = () => {
		setEditName(props.name);
		setEditDescription(props.description ?? "");
		setEditing(true);
	};

	const cancelEditing = () => {
		setEditing(false);
	};

	const saveEditing = () => {
		const trimmedName = editName().trim();
		if (!trimmedName) return;
		props.onSave?.(trimmedName, editDescription().trim());
		setEditing(false);
	};

	return (
		<Stack spacing="md">
			<Show
				when={editing()}
				fallback={
					<>
						<Flex gap="sm" align="center" wrap="wrap" class="min-w-0">
							<Heading level="h1" class="min-w-0 truncate">
								{props.name}
							</Heading>
							<div class="shrink-0 ml-auto flex items-center gap-2">
								<Show when={props.canEdit}>
									<button
										type="button"
										onClick={startEditing}
										class="inline-flex items-center justify-center rounded-radius border border-outline-strong text-on-surface text-sm font-medium transition hover:border-primary hover:text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-outline-dark-strong dark:text-on-surface-dark dark:hover:border-primary-dark dark:hover:text-primary-dark dark:hover:bg-primary-dark/10 dark:focus-visible:outline-primary-dark aspect-square h-[34px]"
									>
										<PencilIcon size="xs" />
									</button>
								</Show>
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

						<Show when={!props.description && props.canEdit}>
							<Text
								color="muted"
								size="sm"
								class="italic cursor-pointer"
								onClick={startEditing}
							>
								Add a description...
							</Text>
						</Show>
					</>
				}
			>
				<Stack spacing="sm">
					<Flex gap="sm" align="center" class="min-w-0">
						<Input
							value={editName()}
							onInput={(e) => setEditName(e.currentTarget.value)}
							placeholder="Project name"
							maxLength={100}
							size="sm"
							class="font-bold"
						/>
						<div class="shrink-0 flex items-center gap-1">
							<button
								type="button"
								onClick={saveEditing}
								disabled={!editName().trim()}
								class="inline-flex items-center justify-center rounded-radius border border-primary bg-primary text-on-primary transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed dark:border-primary-dark dark:bg-primary-dark dark:text-on-primary-dark dark:hover:bg-primary-dark/90 dark:focus-visible:outline-primary-dark h-[34px] aspect-square"
							>
								<CheckIcon size="xs" />
							</button>
							<button
								type="button"
								onClick={cancelEditing}
								class="inline-flex items-center justify-center rounded-radius border border-outline-strong text-on-surface transition hover:border-danger hover:text-danger hover:bg-danger/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:border-outline-dark-strong dark:text-on-surface-dark dark:hover:border-danger-dark dark:hover:text-danger-dark dark:hover:bg-danger-dark/10 dark:focus-visible:outline-primary-dark h-[34px] aspect-square"
							>
								<XIcon size="xs" />
							</button>
						</div>
					</Flex>
					<Textarea
						value={editDescription()}
						onInput={(e) => setEditDescription(e.currentTarget.value)}
						placeholder="Describe your project..."
						maxLength={500}
						rows={3}
						size="sm"
					/>
				</Stack>
			</Show>

			<Flex gap="sm" align="center">
				<Badge variant="secondary" size="sm">
					{props.memberCount} {props.memberCount === 1 ? "member" : "members"}
				</Badge>
			</Flex>
		</Stack>
	);
};

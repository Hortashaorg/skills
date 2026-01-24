import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import {
	AddToProjectPopover,
	type Project,
} from "@/components/composite/add-to-project-popover";
import { EditableField } from "@/components/composite/editable-field";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import {
	ExternalLinkIcon,
	PlusIcon,
	XIcon,
} from "@/components/primitives/icon";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { UpvoteButton } from "@/components/ui/upvote-button";
import { getAuthorizationUrl, saveReturnUrl } from "@/lib/auth-url";
import { cn } from "@/lib/utils";

export interface EcosystemHeaderProps {
	ecosystemId: string;
	name: string;
	description?: string | null;
	website?: string | null;
	tags: readonly { id: string; name: string; slug: string }[];
	pendingRemoveTagIds: ReadonlySet<string>;
	upvoteCount: number;
	hasUpvoted: boolean;
	isLoggedIn: boolean;
	onUpvote: () => void;
	onAddTag: () => void;
	onRemoveTag: (tagId: string) => void;
	onEditDescription?: () => void;
	projects: readonly Project[];
	isInProject: (projectId: string) => boolean;
	onAddToProject: (projectId: string) => void;
	addingToProjectId?: string | null;
}

const formatUrl = (url: string): string => {
	try {
		const parsed = new URL(url);
		return parsed.host + (parsed.pathname !== "/" ? parsed.pathname : "");
	} catch {
		return url;
	}
};

export const EcosystemHeader = (props: EcosystemHeaderProps) => {
	return (
		<Stack spacing="md">
			{/* Title row with upvote and add to project */}
			<Flex gap="sm" align="center" wrap="wrap" class="min-w-0">
				<Heading level="h1" class="min-w-0 truncate">
					{props.name}
				</Heading>
				<div class="shrink-0 ml-auto flex items-center gap-2">
					<Show
						when={props.isLoggedIn}
						fallback={
							<button
								type="button"
								onClick={() => {
									saveReturnUrl();
									window.location.href = getAuthorizationUrl();
								}}
								class="text-sm text-primary dark:text-primary-dark hover:underline cursor-pointer"
							>
								Sign in to upvote
							</button>
						}
					>
						<UpvoteButton
							count={props.upvoteCount}
							isUpvoted={props.hasUpvoted}
							disabled={false}
							onClick={props.onUpvote}
							size="md"
						/>
						<AddToProjectPopover
							projects={props.projects}
							isInProject={props.isInProject}
							onAdd={props.onAddToProject}
							addingToProjectId={props.addingToProjectId}
						/>
					</Show>
				</div>
			</Flex>

			{/* Description */}
			<Show when={props.description}>
				<Show
					when={props.onEditDescription}
					fallback={
						<Text color="muted" class="line-clamp-5 sm:line-clamp-3">
							{props.description}
						</Text>
					}
				>
					{(onEdit) => (
						<EditableField onEdit={onEdit()}>
							<Text color="muted" class="line-clamp-5 sm:line-clamp-3">
								{props.description}
							</Text>
						</EditableField>
					)}
				</Show>
			</Show>

			{/* Website link */}
			<Show when={props.website} keyed>
				{(website) => (
					<Flex gap="sm" align="center" class="min-w-0">
						<Text size="sm" color="muted" class="shrink-0">
							Homepage
						</Text>
						<a
							href={website}
							target="_blank"
							rel="noopener noreferrer"
							class="text-sm text-primary dark:text-primary-dark hover:underline truncate inline-flex items-center gap-1 min-w-0"
						>
							<span class="truncate">{formatUrl(website)}</span>
							<ExternalLinkIcon size="xs" class="shrink-0" />
						</a>
					</Flex>
				)}
			</Show>

			{/* Tags */}
			<Flex gap="xs" wrap="wrap" align="center">
				<For each={props.tags}>
					{(tag) => {
						const isPendingRemoval = () =>
							props.pendingRemoveTagIds.has(tag.id);
						return (
							<Badge
								variant="secondary"
								size="sm"
								class={cn(
									"inline-flex items-center gap-1 pr-1",
									isPendingRemoval() && "opacity-50",
								)}
							>
								<A
									href={`/ecosystems?tags=${tag.slug}`}
									class="hover:underline"
								>
									{tag.name}
								</A>
								<Show when={props.isLoggedIn}>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											e.preventDefault();
											e.currentTarget.blur();
											props.onRemoveTag(tag.id);
										}}
										disabled={isPendingRemoval()}
										class="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
										title={
											isPendingRemoval()
												? "Removal pending"
												: "Suggest removing this tag"
										}
									>
										<XIcon size="xs" />
									</button>
								</Show>
							</Badge>
						);
					}}
				</For>
				<button
					type="button"
					onClick={(e) => {
						e.currentTarget.blur();
						props.onAddTag();
					}}
					class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border border-dashed border-outline hover:border-primary hover:text-primary dark:border-outline-dark dark:hover:border-primary-dark dark:hover:text-primary-dark transition-colors cursor-pointer"
				>
					<PlusIcon size="xs" />
					<span>Add tag</span>
				</button>
			</Flex>
		</Stack>
	);
};

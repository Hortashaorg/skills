import { Popover } from "@kobalte/core/popover";
import { mutators, queries, useQuery, useZero } from "@package/database/client";
import { A } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";
import { EditableField } from "@/components/composite/editable-field";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import {
	CheckIcon,
	ChevronDownIcon,
	ExternalLinkIcon,
	PlusIcon,
} from "@/components/primitives/icon";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { UpvoteButton } from "@/components/ui/upvote-button";
import { getAuthorizationUrl, saveReturnUrl } from "@/lib/auth-url";
import { handleMutationError } from "@/lib/mutation-error";
import { cn } from "@/lib/utils";

export interface EcosystemHeaderProps {
	ecosystemId: string;
	name: string;
	description?: string | null;
	website?: string | null;
	tags: readonly { name: string; slug: string }[];
	upvoteCount: number;
	hasUpvoted: boolean;
	isLoggedIn: boolean;
	onUpvote: () => void;
	onAddTag: () => void;
	onEditDescription?: () => void;
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
	const zero = useZero();

	// Projects for add-to-project
	const [projects] = useQuery(() => queries.projects.mine({}));
	const [addingToProject, setAddingToProject] = createSignal<string | null>(
		null,
	);

	const isEcosystemInProject = (projectId: string) => {
		const project = projects()?.find((p) => p.id === projectId);
		return project?.projectEcosystems?.some(
			(pe) => pe.ecosystemId === props.ecosystemId,
		);
	};

	const handleAddToProject = async (projectId: string) => {
		if (isEcosystemInProject(projectId)) return;

		setAddingToProject(projectId);
		try {
			zero().mutate(
				mutators.projectEcosystems.add({
					projectId,
					ecosystemId: props.ecosystemId,
				}),
			);
		} catch (err) {
			handleMutationError(err, "add ecosystem to project");
		} finally {
			setAddingToProject(null);
		}
	};

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
						<Popover>
							<Popover.Trigger
								class={cn(
									"inline-flex items-center gap-1.5 h-8 px-3 rounded-radius border whitespace-nowrap",
									"border-outline-strong dark:border-outline-dark-strong",
									"bg-transparent text-on-surface dark:text-on-surface-dark",
									"text-sm font-medium",
									"hover:opacity-75 transition",
									"focus-visible:outline-2 focus-visible:outline-offset-2",
									"focus-visible:outline-primary dark:focus-visible:outline-primary-dark",
									"cursor-pointer",
								)}
							>
								<PlusIcon size="sm" title="Add to project" />
								<span>Add to project</span>
								<ChevronDownIcon
									size="xs"
									class="text-on-surface-muted dark:text-on-surface-dark-muted"
								/>
							</Popover.Trigger>
							<Popover.Portal>
								<Popover.Content
									class={cn(
										"z-50 min-w-56 max-h-64 overflow-auto",
										"rounded-radius border border-outline dark:border-outline-dark",
										"bg-surface dark:bg-surface-dark shadow-lg",
										"ui-expanded:animate-in ui-expanded:fade-in-0 ui-expanded:zoom-in-95",
										"ui-closed:animate-out ui-closed:fade-out-0 ui-closed:zoom-out-95",
									)}
								>
									<Show
										when={(projects()?.length ?? 0) > 0}
										fallback={
											<div class="p-4 text-center">
												<Text size="sm" color="muted" class="mb-2">
													No projects yet
												</Text>
												<A
													href="/me/projects/new"
													class="text-sm text-primary dark:text-primary-dark hover:underline"
												>
													Create a project
												</A>
											</div>
										}
									>
										<div class="p-1">
											<For each={projects()}>
												{(project) => {
													const isInProject = () =>
														isEcosystemInProject(project.id);
													const isAdding = () =>
														addingToProject() === project.id;
													return (
														<button
															type="button"
															class={cn(
																"w-full text-left px-3 py-2 text-sm rounded-sm",
																"flex items-center justify-between gap-2",
																"text-on-surface dark:text-on-surface-dark",
																"hover:bg-surface-alt dark:hover:bg-surface-dark-alt",
																"transition-colors cursor-pointer",
																"disabled:opacity-50 disabled:cursor-not-allowed",
															)}
															disabled={isInProject() || isAdding()}
															onClick={() => handleAddToProject(project.id)}
														>
															<span class="truncate">{project.name}</span>
															<Show when={isInProject()}>
																<CheckIcon
																	size="sm"
																	class="text-success shrink-0"
																	title="Already in project"
																/>
															</Show>
															<Show when={isAdding()}>
																<span class="text-xs text-on-surface-muted dark:text-on-surface-dark-muted">
																	Adding...
																</span>
															</Show>
														</button>
													);
												}}
											</For>
										</div>
										<div class="border-t border-outline dark:border-outline-dark p-2">
											<A
												href="/me/projects/new"
												class="block w-full text-center text-xs text-primary dark:text-primary-dark hover:underline"
											>
												+ Create new project
											</A>
										</div>
									</Show>
								</Popover.Content>
							</Popover.Portal>
						</Popover>
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
					{(tag) => (
						<A href={`/ecosystems?tags=${tag.slug}`}>
							<Badge variant="secondary" size="sm">
								{tag.name}
							</Badge>
						</A>
					)}
				</For>
				<button
					type="button"
					onClick={props.onAddTag}
					class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border border-dashed border-outline hover:border-primary hover:text-primary dark:border-outline-dark dark:hover:border-primary-dark dark:hover:text-primary-dark transition-colors"
				>
					<PlusIcon size="xs" />
					<span>Add tag</span>
				</button>
			</Flex>
		</Stack>
	);
};

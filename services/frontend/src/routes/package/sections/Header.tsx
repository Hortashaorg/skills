import { Popover } from "@kobalte/core/popover";
import { formatShortDate } from "@package/common";
import {
	mutators,
	queries,
	type Row,
	useQuery,
	useZero,
} from "@package/database/client";
import { A } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import {
	CheckIcon,
	ChevronDownIcon,
	ExternalLinkIcon,
	PlusIcon,
	SpinnerIcon,
} from "@/components/primitives/icon";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UpvoteButton } from "@/components/ui/upvote-button";
import { createPackageRequest } from "@/hooks/createPackageRequest";
import { createPackageUpvote } from "@/hooks/createPackageUpvote";
import { getAuthorizationUrl, saveReturnUrl } from "@/lib/auth-url";
import { handleMutationError } from "@/lib/mutation-error";
import { cn } from "@/lib/utils";

type Package = Row["packages"] & {
	upvotes?: readonly Row["packageUpvotes"][];
};

export interface HeaderProps {
	pkg: Package;
}

const formatUrl = (url: string): string => {
	try {
		const parsed = new URL(url);
		return parsed.host + (parsed.pathname !== "/" ? parsed.pathname : "");
	} catch {
		return url;
	}
};

export const Header = (props: HeaderProps) => {
	const zero = useZero();
	const upvote = createPackageUpvote(() => props.pkg);
	const request = createPackageRequest(() => ({
		name: props.pkg.name,
		registry: props.pkg.registry,
	}));

	const isLoggedIn = () => zero().userID !== "anon";

	// Tags query
	const [packageWithTags] = useQuery(() =>
		queries.packages.byIdWithTags({ id: props.pkg.id }),
	);
	const [allTags] = useQuery(() => queries.tags.list());

	const packageTags = createMemo(() => packageWithTags()?.packageTags ?? []);
	const tagsById = createMemo(() => {
		const all = allTags() ?? [];
		return new Map(all.map((t) => [t.id, t]));
	});

	// Projects for add-to-project
	const [projects] = useQuery(() => queries.projects.mine());
	const [addingToProject, setAddingToProject] = createSignal<string | null>(
		null,
	);

	const isPackageInProject = (projectId: string) => {
		const project = projects()?.find((p) => p.id === projectId);
		return project?.projectPackages?.some(
			(pp) => pp.packageId === props.pkg.id,
		);
	};

	const handleAddToProject = async (projectId: string) => {
		if (isPackageInProject(projectId)) return;

		setAddingToProject(projectId);
		try {
			zero().mutate(
				mutators.projectPackages.add({
					projectId,
					packageId: props.pkg.id,
				}),
			);
		} catch (err) {
			handleMutationError(err, "add package to project");
		} finally {
			setAddingToProject(null);
		}
	};

	return (
		<Card padding="lg">
			<Stack spacing="md">
				{/* Title row with badge and upvote */}
				<Flex gap="sm" align="center" wrap="wrap" class="min-w-0">
					<Heading level="h1" class="min-w-0 truncate">
						{props.pkg.name}
					</Heading>
					<Badge variant="secondary" size="sm" class="shrink-0">
						{props.pkg.registry}
					</Badge>
					<div class="shrink-0 ml-auto">
						<Show
							when={isLoggedIn()}
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
								count={upvote.upvoteCount()}
								isUpvoted={upvote.isUpvoted()}
								disabled={upvote.isDisabled()}
								onClick={upvote.toggle}
								size="md"
							/>
						</Show>
					</div>
				</Flex>

				{/* Tags */}
				<Show when={packageTags().length > 0}>
					<Flex align="center" wrap="wrap" gap="sm">
						<For each={packageTags()}>
							{(pt) => (
								<Badge variant="secondary" size="sm">
									{tagsById().get(pt.tagId)?.name ?? "Unknown"}
								</Badge>
							)}
						</For>
					</Flex>
				</Show>

				{/* Description */}
				<Show when={props.pkg.description}>
					<Text color="muted" class="line-clamp-5 sm:line-clamp-3">
						{props.pkg.description}
					</Text>
				</Show>

				{/* Links section */}
				<Show when={props.pkg.homepage || props.pkg.repository}>
					<Stack spacing="xs">
						<Show when={props.pkg.homepage}>
							{(url) => (
								<Flex gap="sm" align="center" class="min-w-0">
									<Text size="sm" color="muted" class="shrink-0">
										Homepage
									</Text>
									<a
										href={url()}
										target="_blank"
										rel="noopener noreferrer"
										class="text-sm text-primary dark:text-primary-dark hover:underline truncate inline-flex items-center gap-1 min-w-0"
									>
										<span class="truncate">{formatUrl(url())}</span>
										<ExternalLinkIcon size="xs" class="shrink-0" />
									</a>
								</Flex>
							)}
						</Show>
						<Show when={props.pkg.repository}>
							{(url) => (
								<Flex gap="sm" align="center" class="min-w-0">
									<Text size="sm" color="muted" class="shrink-0">
										Repository
									</Text>
									<a
										href={url()}
										target="_blank"
										rel="noopener noreferrer"
										class="text-sm text-primary dark:text-primary-dark hover:underline truncate inline-flex items-center gap-1 min-w-0"
									>
										<span class="truncate">{formatUrl(url())}</span>
										<ExternalLinkIcon size="xs" class="shrink-0" />
									</a>
								</Flex>
							)}
						</Show>
					</Stack>
				</Show>

				{/* Footer: Sync info + Actions */}
				<Flex gap="md" align="center" wrap="wrap" class="pt-2 border-t border-outline dark:border-outline-dark">
					<Flex gap="sm" align="center" class="min-w-0">
						<Text size="xs" color="muted">
							Synced {formatShortDate(props.pkg.lastFetchSuccess)}
						</Text>
						<Show when={!request.isDisabled()}>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => request.submit()}
								disabled={request.isSubmitting()}
							>
								<Show
									when={request.isSubmitting()}
									fallback="Refresh"
								>
									<SpinnerIcon size="sm" class="mr-1" />
									Syncing
								</Show>
							</Button>
						</Show>
					</Flex>

					<div class="ml-auto shrink-0">
						<Show when={isLoggedIn()}>
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
															isPackageInProject(project.id);
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
			</Stack>
		</Card>
	);
};

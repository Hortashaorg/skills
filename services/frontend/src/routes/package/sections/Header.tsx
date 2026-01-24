import { Popover } from "@kobalte/core/popover";
import { formatShortDate } from "@package/common";
import {
	getSuggestionTypeLabel,
	isPowerUser,
	mutators,
	queries,
	type Row,
	useQuery,
	useZero,
} from "@package/database/client";
import { A } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import {
	type SuggestionItem,
	SuggestionModal,
} from "@/components/feature/suggestion-modal";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import {
	CheckIcon,
	ChevronDownIcon,
	ExternalLinkIcon,
	PlusIcon,
	SpinnerIcon,
	XIcon,
} from "@/components/primitives/icon";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Textarea } from "@/components/primitives/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { UpvoteButton } from "@/components/ui/upvote-button";
import { getAuthData } from "@/context/app-provider";
import { createPackageRequest } from "@/hooks/createPackageRequest";
import { createPackageUpvote } from "@/hooks/createPackageUpvote";
import { createPolledValue } from "@/hooks/createPolledValue";
import { getDisplayName } from "@/lib/account";
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

	// Fetch history to check for pending sync
	const [fetchHistory] = useQuery(() =>
		queries.packageFetches.byPackageId({ packageId: props.pkg.id }),
	);

	const hasPendingFetch = createMemo(() => {
		const history = fetchHistory();
		if (!history?.length) return false;
		return history[0]?.status === "pending";
	});

	const pendingFetchCreatedAt = createMemo(() => {
		const history = fetchHistory();
		if (!history?.length || history[0]?.status !== "pending") return null;
		return history[0].createdAt;
	});

	// Queue position polling (REST endpoint, not real-time like Zero)
	const queuePosition = createPolledValue<{ ahead: number }>(
		() => {
			const createdAt = pendingFetchCreatedAt();
			return createdAt ? `/api/queue/ahead?before=${createdAt}` : null;
		},
		{ interval: 30_000 },
	);

	// Projects for add-to-project
	const [projects] = useQuery(() => queries.projects.mine({}));
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

	// Tag suggestion modal state
	const [tagModalOpen, setTagModalOpen] = createSignal(false);
	const [selectedTagId, setSelectedTagId] = createSignal<string>();

	// Remove tag modal state
	const [removeTagModalOpen, setRemoveTagModalOpen] = createSignal(false);
	const [removeTagId, setRemoveTagId] = createSignal<string | null>(null);
	const [removeTagJustification, setRemoveTagJustification] = createSignal("");

	// Pending tag suggestions for this package
	const [pendingSuggestions] = useQuery(() =>
		queries.suggestions.pendingForPackage({ packageId: props.pkg.id }),
	);

	// Tags that are already on the package
	const existingTagIds = createMemo(() => {
		return new Set(packageTags().map((pt) => pt.tagId));
	});

	// Tags pending suggestion (to exclude from picker)
	const pendingTagIds = createMemo(() => {
		const suggestions = pendingSuggestions() ?? [];
		return new Set(
			suggestions
				.filter((s) => s.type === "add_tag")
				.map((s) => (s.payload as { tagId?: string })?.tagId)
				.filter(Boolean) as string[],
		);
	});

	// Available tags for suggestion picker
	const availableTags = createMemo(() => {
		const all = allTags() ?? [];
		const existing = existingTagIds();
		const pending = pendingTagIds();
		return all
			.filter((t) => !existing.has(t.id) && !pending.has(t.id))
			.sort((a, b) => a.name.localeCompare(b.name));
	});

	const tagOptions = createMemo(() =>
		availableTags().map((t) => ({ value: t.id, label: t.name })),
	);

	// Format pending suggestions for modal
	const tagSuggestions = createMemo((): SuggestionItem[] => {
		const suggestions = pendingSuggestions() ?? [];
		return suggestions
			.filter((s) => s.type === "add_tag")
			.map((s) => {
				const tagId = (s.payload as { tagId?: string })?.tagId;
				const tagName = tagId ? tagsById().get(tagId)?.name : undefined;
				return {
					id: s.id,
					type: s.type,
					typeLabel: getSuggestionTypeLabel(s.type),
					description: tagName ?? "Unknown tag",
					justification: s.justification,
					authorName: getDisplayName(s.account),
					authorId: s.accountId,
					votes: s.votes ?? [],
				};
			});
	});

	const handleSuggestTag = (justification?: string) => {
		const tagId = selectedTagId();
		if (!tagId) return;

		try {
			zero().mutate(
				mutators.suggestions.create({
					type: "add_tag",
					packageId: props.pkg.id,
					payload: { tagId },
					justification,
				}),
			);
			setSelectedTagId(undefined);
			setTagModalOpen(false);
			const roles = getAuthData()?.roles ?? [];
			if (isPowerUser(roles)) {
				toast.success("Tag has been applied.", "Applied");
			} else {
				toast.success(
					"Your tag suggestion is now pending review.",
					"Suggestion submitted",
				);
			}
		} catch (err) {
			handleMutationError(err, "submit suggestion", { useErrorMessage: true });
		}
	};

	const handleVote = (suggestionId: string, vote: "approve" | "reject") => {
		try {
			zero().mutate(mutators.suggestionVotes.vote({ suggestionId, vote }));
			toast.success(
				"Your vote has been recorded.",
				vote === "approve" ? "Approved" : "Rejected",
			);
		} catch (err) {
			handleMutationError(err, "vote", { useErrorMessage: true });
		}
	};

	const handleAddTag = () => {
		if (!isLoggedIn()) {
			toast.info("Sign in to suggest tags.", "Sign in required");
			return;
		}
		setTagModalOpen(true);
	};

	// Tags pending removal suggestion
	const pendingRemoveTagIds = createMemo(() => {
		const suggestions = pendingSuggestions() ?? [];
		return new Set(
			suggestions
				.filter((s) => s.type === "remove_tag")
				.map((s) => (s.payload as { tagId?: string })?.tagId)
				.filter(Boolean) as string[],
		);
	});

	const handleRemoveTag = (tagId: string) => {
		if (!isLoggedIn()) {
			toast.info("Sign in to suggest tag removal.", "Sign in required");
			return;
		}

		if (pendingRemoveTagIds().has(tagId)) {
			toast.info(
				"A suggestion to remove this tag is already pending.",
				"Already pending",
			);
			return;
		}

		setRemoveTagId(tagId);
		setRemoveTagJustification("");
		setRemoveTagModalOpen(true);
	};

	const handleConfirmRemoveTag = () => {
		const tagId = removeTagId();
		if (!tagId) return;

		try {
			zero().mutate(
				mutators.suggestions.create({
					type: "remove_tag",
					packageId: props.pkg.id,
					payload: { tagId },
					justification: removeTagJustification() || undefined,
				}),
			);
			setRemoveTagModalOpen(false);
			setRemoveTagId(null);
			setRemoveTagJustification("");
			const roles = getAuthData()?.roles ?? [];
			if (isPowerUser(roles)) {
				toast.success("Tag has been removed.", "Applied");
			} else {
				toast.success(
					"Your suggestion to remove this tag is now pending review.",
					"Suggestion submitted",
				);
			}
		} catch (err) {
			handleMutationError(err, "submit suggestion", { useErrorMessage: true });
		}
	};

	const removeTagName = createMemo(() => {
		const tagId = removeTagId();
		return tagId ? (tagsById().get(tagId)?.name ?? "Unknown") : "";
	});

	const handleLogin = () => {
		saveReturnUrl();
		window.location.href = getAuthorizationUrl();
	};

	const currentUserId = () => (isLoggedIn() ? zero().userID : null);

	return (
		<Stack spacing="md">
			{/* Title row with badge, upvote and add to project */}
			<Flex gap="sm" align="center" wrap="wrap" class="min-w-0">
				<Heading level="h1" class="min-w-0 truncate">
					{props.pkg.name}
				</Heading>
				<Badge variant="secondary" size="sm" class="shrink-0">
					{props.pkg.registry}
				</Badge>
				<div class="shrink-0 ml-auto flex items-center gap-2">
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

			{/* Tags */}
			<Flex align="center" wrap="wrap" gap="sm">
				<For each={packageTags()}>
					{(pt) => {
						const tagName = () => tagsById().get(pt.tagId)?.name ?? "Unknown";
						const isPendingRemoval = () => pendingRemoveTagIds().has(pt.tagId);
						return (
							<Badge
								variant="secondary"
								size="sm"
								class={cn(
									"inline-flex items-center gap-1 pr-1",
									isPendingRemoval() && "opacity-50",
								)}
							>
								<span>{tagName()}</span>
								<Show when={isLoggedIn()}>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											e.currentTarget.blur();
											handleRemoveTag(pt.tagId);
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
						handleAddTag();
					}}
					class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border border-dashed border-outline hover:border-primary hover:text-primary dark:border-outline-dark dark:hover:border-primary-dark dark:hover:text-primary-dark transition-colors cursor-pointer"
				>
					<PlusIcon size="xs" />
					<span>Add tag</span>
				</button>
			</Flex>

			{/* Footer: Sync info */}
			<Flex
				gap="sm"
				align="center"
				wrap="wrap"
				class="pt-2 border-t border-outline dark:border-outline-dark"
			>
				<Show
					when={!hasPendingFetch()}
					fallback={
						<Flex gap="xs" align="center">
							<SpinnerIcon
								size="sm"
								class="text-primary dark:text-primary-dark"
							/>
							<Text size="xs" color="muted">
								<Show
									when={(queuePosition()?.ahead ?? 0) > 0}
									fallback="Queued"
								>
									{queuePosition()?.ahead} in queue
								</Show>
							</Text>
						</Flex>
					}
				>
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
							<Show when={request.isSubmitting()} fallback="Refresh">
								<SpinnerIcon size="sm" class="mr-1" />
								Syncing
							</Show>
						</Button>
					</Show>
				</Show>
			</Flex>
			<SuggestionModal
				open={tagModalOpen()}
				onOpenChange={setTagModalOpen}
				title="Suggest Tags"
				description="Help categorize this package by suggesting relevant tags."
				isLoggedIn={isLoggedIn()}
				onLoginClick={handleLogin}
				currentUserId={currentUserId()}
				pendingSuggestions={tagSuggestions()}
				onVote={handleVote}
				onSubmit={handleSuggestTag}
				submitLabel="Suggest Tag"
				isFormDisabled={!selectedTagId()}
				formContent={
					<Select
						options={tagOptions()}
						value={selectedTagId()}
						onChange={setSelectedTagId}
						placeholder="Select a tag..."
						size="sm"
					/>
				}
			/>

			<Dialog
				open={removeTagModalOpen()}
				onOpenChange={setRemoveTagModalOpen}
				title="Remove Tag"
				description={`Are you sure you want to suggest removing the "${removeTagName()}" tag?`}
			>
				<Stack spacing="md">
					<Textarea
						value={removeTagJustification()}
						onInput={(e) => setRemoveTagJustification(e.currentTarget.value)}
						placeholder="Why should this tag be removed? (optional)"
						rows={3}
						size="sm"
					/>
					<Flex gap="sm" justify="end">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setRemoveTagModalOpen(false)}
						>
							Cancel
						</Button>
						<Button variant="danger" size="sm" onClick={handleConfirmRemoveTag}>
							Submit Suggestion
						</Button>
					</Flex>
				</Stack>
			</Dialog>
		</Stack>
	);
};

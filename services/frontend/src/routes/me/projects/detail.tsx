import {
	mutators,
	queries,
	type Row,
	useQuery,
	useZero,
} from "@package/database/client";
import { A, useNavigate, useParams } from "@solidjs/router";
import { createMemo, createSignal, For, Show } from "solid-js";
import {
	SearchInput,
	type SearchResultItem,
} from "@/components/composite/search-input";
import { PackageCard } from "@/components/feature/package-card";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { PencilIcon } from "@/components/primitives/icon";
import { Input } from "@/components/primitives/input";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Textarea } from "@/components/primitives/textarea";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { createPackageUpvote } from "@/hooks/createPackageUpvote";
import { Layout } from "@/layout/Layout";
import { buildPackageUrl } from "@/lib/url";

const SEARCH_PACKAGES_PREFIX = "SEARCH_PACKAGES:";

type Package = Row["packages"] & {
	upvotes?: readonly Row["packageUpvotes"][];
};

const ProjectDetailSkeleton = () => (
	<Stack spacing="lg">
		<Flex justify="between" align="center">
			<Skeleton variant="text" width="200px" height="32px" />
			<Skeleton variant="rectangular" width="80px" height="36px" />
		</Flex>
		<Skeleton variant="text" width="60%" />
		<Card padding="lg">
			<Stack spacing="md">
				<Skeleton variant="text" width="120px" height="24px" />
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<Skeleton variant="rectangular" height="100px" />
					<Skeleton variant="rectangular" height="100px" />
					<Skeleton variant="rectangular" height="100px" />
				</div>
			</Stack>
		</Card>
	</Stack>
);

export const ProjectDetail = () => {
	const params = useParams<{ id: string }>();
	const navigate = useNavigate();
	const zero = useZero();

	const [project, projectResult] = useQuery(() =>
		queries.projects.byId({ id: params.id }),
	);

	const [isEditing, setIsEditing] = createSignal(false);
	const [editName, setEditName] = createSignal("");
	const [editDescription, setEditDescription] = createSignal("");
	const [isSaving, setIsSaving] = createSignal(false);
	const [packageSearch, setPackageSearch] = createSignal("");
	const [deleteDialogOpen, setDeleteDialogOpen] = createSignal(false);
	const [removePackageId, setRemovePackageId] = createSignal<string | null>(
		null,
	);

	// Search for packages to add
	const [searchResults, searchResultsStatus] = useQuery(() =>
		queries.packages.search({
			query: packageSearch() || undefined,
			limit: 10,
		}),
	);

	// Exact match query for prioritization
	const [exactMatch] = useQuery(() =>
		queries.packages.exactMatch({
			name: packageSearch().trim(),
		}),
	);

	const isLoading = () => projectResult().type !== "complete";
	const isSearching = () =>
		searchResultsStatus().type !== "complete" && packageSearch().length > 0;
	const isOwner = () => {
		const p = project();
		return p && zero().userID !== "anon" && p.accountId === zero().userID;
	};

	const packages = () => {
		const p = project();
		if (!p) return [];
		return p.projectPackages
			.map((pp) => pp.package)
			.filter((pkg): pkg is NonNullable<typeof pkg> => pkg != null);
	};

	const existingPackageIds = createMemo(
		() => new Set(packages().map((p) => p.id)),
	);

	// Group packages by tag - packages with multiple tags appear in multiple groups
	const packagesByTag = createMemo(() => {
		const pkgs = packages();
		const groups: Record<string, typeof pkgs> = {};
		const uncategorized: typeof pkgs = [];

		for (const pkg of pkgs) {
			const tags = pkg.packageTags ?? [];
			if (tags.length === 0) {
				uncategorized.push(pkg);
			} else {
				for (const pt of tags) {
					const tagName = pt.tag?.name;
					if (tagName) {
						if (!groups[tagName]) {
							groups[tagName] = [];
						}
						groups[tagName].push(pkg);
					}
				}
			}
		}

		// Sort tag names alphabetically
		const sortedTags = Object.keys(groups).sort((a, b) =>
			a.toLowerCase().localeCompare(b.toLowerCase()),
		);

		return { groups, sortedTags, uncategorized };
	});

	const getPackageSecondary = (pkg: {
		description?: string | null;
		status?: string | null;
		failureReason?: string | null;
	}) => {
		if (pkg.status === "failed") {
			return pkg.failureReason || "Failed to fetch";
		}
		if (pkg.status === "placeholder") {
			return "Pending fetch...";
		}
		return pkg.description ?? undefined;
	};

	const getPackageLabel = (pkg: {
		registry: string;
		status?: string | null;
	}) => {
		if (pkg.status === "failed") return "failed";
		if (pkg.status === "placeholder") return "pending";
		return pkg.registry;
	};

	const packageSearchResults = createMemo((): SearchResultItem[] => {
		const results = searchResults() ?? [];
		const existing = existingPackageIds();
		const exact = exactMatch();
		const searchTerm = packageSearch().trim();
		const items: SearchResultItem[] = [];

		// Add exact match first if not already in project
		if (exact && !existing.has(exact.id)) {
			items.push({
				id: exact.id,
				primary: exact.name,
				secondary: getPackageSecondary(exact),
				label: getPackageLabel(exact),
			});
		}

		// Add "search on packages page" option when no exact match
		if (!exact && searchTerm.length > 0) {
			items.push({
				id: `${SEARCH_PACKAGES_PREFIX}${searchTerm}`,
				primary: `Search "${searchTerm}" on Packages page`,
				secondary: "Request new packages there",
				label: "→",
				isAction: true,
			});
		}

		// Add rest of search results (excluding exact match to avoid duplication)
		for (const pkg of results) {
			if (existing.has(pkg.id)) continue;
			if (exact && pkg.id === exact.id) continue;
			items.push({
				id: pkg.id,
				primary: pkg.name,
				secondary: getPackageSecondary(pkg),
				label: getPackageLabel(pkg),
			});
		}

		return items;
	});

	const handleAddPackage = (item: SearchResultItem) => {
		// Navigate to packages page with search term
		if (item.id.startsWith(SEARCH_PACKAGES_PREFIX)) {
			const searchTerm = item.id.slice(SEARCH_PACKAGES_PREFIX.length);
			navigate(`/packages?q=${encodeURIComponent(searchTerm)}`);
			return;
		}

		const p = project();
		if (!p) return;

		zero()
			.mutate(
				mutators.projectPackages.add({
					projectId: p.id,
					packageId: item.id,
				}),
			)
			.client.then(() => {
				setPackageSearch("");
			})
			.catch((err) => {
				console.error("Failed to add package:", err);
				toast.error("Failed to add package. Please try again.");
			});
	};

	const startEditing = () => {
		const p = project();
		if (p) {
			setEditName(p.name);
			setEditDescription(p.description ?? "");
			setIsEditing(true);
		}
	};

	const cancelEditing = () => {
		setIsEditing(false);
		setEditName("");
		setEditDescription("");
	};

	const saveProject = async () => {
		const p = project();
		if (!p || !editName().trim()) return;

		setIsSaving(true);
		try {
			await zero().mutate(
				mutators.projects.update({
					id: p.id,
					name: editName().trim(),
					description: editDescription().trim() || undefined,
				}),
			).client;
			setIsEditing(false);
		} catch (err) {
			console.error("Failed to update project:", err);
			toast.error("Failed to update project. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const confirmRemovePackage = async () => {
		const p = project();
		const packageId = removePackageId();
		if (!p || !packageId) return;

		const projectPackage = p.projectPackages.find(
			(pp) => pp.packageId === packageId,
		);
		if (!projectPackage) return;

		try {
			await zero().mutate(
				mutators.projectPackages.remove({
					id: projectPackage.id,
					projectId: p.id,
				}),
			).client;
		} catch (err) {
			console.error("Failed to remove package:", err);
			toast.error("Failed to remove package. Please try again.");
		}
		setRemovePackageId(null);
	};

	const confirmDelete = async () => {
		const p = project();
		if (!p) return;

		try {
			await zero().mutate(mutators.projects.remove({ id: p.id })).client;
			navigate("/me/projects");
		} catch (err) {
			console.error("Failed to delete project:", err);
			toast.error("Failed to delete project. Please try again.");
		}
	};

	return (
		<Layout>
			<Container size="lg">
				<Stack spacing="lg" class="py-8">
					<Show when={!isLoading()} fallback={<ProjectDetailSkeleton />}>
						<Show
							when={project()}
							fallback={
								<Card padding="lg">
									<Stack spacing="md" align="center">
										<Heading level="h2">Project not found</Heading>
										<Text color="muted">
											This project doesn't exist or has been deleted.
										</Text>
										<A
											href="/me/projects"
											class={buttonVariants({ variant: "secondary" })}
										>
											Back to Projects
										</A>
									</Stack>
								</Card>
							}
						>
							{(p) => (
								<>
									<Show
										when={isEditing()}
										fallback={
											<Flex justify="between" align="start" gap="md">
												<Stack spacing="xs" class="flex-1">
													<Flex align="center" gap="sm">
														<Heading level="h1">{p().name}</Heading>
														<Show when={isOwner()}>
															<button
																type="button"
																onClick={startEditing}
																class="text-on-surface-muted hover:text-on-surface dark:text-on-surface-dark-muted dark:hover:text-on-surface-dark transition p-1"
															>
																<PencilIcon size="sm" title="Edit project" />
															</button>
														</Show>
													</Flex>
													<Show
														when={p().description}
														fallback={
															<Show when={isOwner()}>
																<button
																	type="button"
																	onClick={startEditing}
																	class="text-on-surface-muted dark:text-on-surface-dark-muted hover:text-on-surface dark:hover:text-on-surface-dark transition text-sm"
																>
																	+ Add description
																</button>
															</Show>
														}
													>
														<Text color="muted">{p().description}</Text>
													</Show>
													<Text size="sm" color="muted">
														Created by {p().account?.name ?? "Unknown"}
													</Text>
												</Stack>
												<Show when={isOwner()}>
													<Button
														variant="danger"
														size="sm"
														onClick={() => setDeleteDialogOpen(true)}
													>
														Delete
													</Button>
												</Show>
											</Flex>
										}
									>
										<Card padding="lg">
											<Stack spacing="md">
												<Heading level="h2">Edit Project</Heading>
												<div>
													<Text
														size="sm"
														weight="medium"
														class="mb-1 text-on-surface-strong dark:text-on-surface-dark-strong"
													>
														Name
													</Text>
													<Input
														type="text"
														value={editName()}
														onInput={(e) => setEditName(e.currentTarget.value)}
														onKeyDown={(e) => {
															if (e.key === "Escape") cancelEditing();
														}}
														placeholder="Project name"
														disabled={isSaving()}
														autofocus
													/>
												</div>
												<div>
													<Text
														size="sm"
														weight="medium"
														class="mb-1 text-on-surface-strong dark:text-on-surface-dark-strong"
													>
														Description{" "}
														<span class="font-normal text-on-surface-muted dark:text-on-surface-dark-muted">
															(optional)
														</span>
													</Text>
													<Textarea
														value={editDescription()}
														onInput={(e) =>
															setEditDescription(e.currentTarget.value)
														}
														onKeyDown={(e) => {
															if (e.key === "Escape") cancelEditing();
														}}
														rows={3}
														placeholder="Add a description..."
														disabled={isSaving()}
													/>
												</div>
												<Flex justify="end" gap="sm">
													<Button
														size="sm"
														variant="secondary"
														onClick={cancelEditing}
														disabled={isSaving()}
													>
														Cancel
													</Button>
													<Button
														size="sm"
														variant="primary"
														onClick={saveProject}
														disabled={isSaving() || !editName().trim()}
													>
														{isSaving() ? "Saving..." : "Save Changes"}
													</Button>
												</Flex>
											</Stack>
										</Card>
									</Show>

									<Stack spacing="md">
										<Flex justify="between" align="center">
											<Heading level="h2">
												Packages ({packages().length})
											</Heading>
										</Flex>

										<Show when={isOwner()}>
											<SearchInput
												value={packageSearch()}
												onValueChange={setPackageSearch}
												results={packageSearchResults()}
												isLoading={isSearching()}
												onSelect={handleAddPackage}
												placeholder="Search packages to add..."
											/>
										</Show>

										<Show
											when={packages().length > 0}
											fallback={
												<Card padding="lg">
													<Stack spacing="sm" align="center">
														<Text color="muted">
															No packages in this project yet.
														</Text>
														<Show
															when={isOwner()}
															fallback={
																<Text size="sm" color="muted">
																	The owner can add packages to this project.
																</Text>
															}
														>
															<Text size="sm" color="muted">
																Use the search above to add packages.
															</Text>
														</Show>
													</Stack>
												</Card>
											}
										>
											<Stack spacing="lg">
												{/* Tagged sections */}
												<For each={packagesByTag().sortedTags}>
													{(tagName) => (
														<Stack spacing="sm">
															<Heading level="h3">{tagName}</Heading>
															<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
																<For each={packagesByTag().groups[tagName]}>
																	{(pkg) => {
																		const upvote = createPackageUpvote(
																			() => pkg as Package,
																		);
																		return (
																			<PackageCard
																				name={pkg.name}
																				registry={pkg.registry}
																				description={pkg.description}
																				href={buildPackageUrl(
																					pkg.registry,
																					pkg.name,
																				)}
																				upvoteCount={upvote.upvoteCount()}
																				isUpvoted={upvote.isUpvoted()}
																				upvoteDisabled={upvote.isDisabled()}
																				onUpvote={upvote.toggle}
																				onRemove={
																					isOwner()
																						? () => setRemovePackageId(pkg.id)
																						: undefined
																				}
																			/>
																		);
																	}}
																</For>
															</div>
														</Stack>
													)}
												</For>

												{/* Uncategorized section */}
												<Show when={packagesByTag().uncategorized.length > 0}>
													<Stack spacing="sm">
														<Heading level="h3">Uncategorized</Heading>
														<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
															<For each={packagesByTag().uncategorized}>
																{(pkg) => {
																	const upvote = createPackageUpvote(
																		() => pkg as Package,
																	);
																	return (
																		<PackageCard
																			name={pkg.name}
																			registry={pkg.registry}
																			description={pkg.description}
																			href={buildPackageUrl(
																				pkg.registry,
																				pkg.name,
																			)}
																			upvoteCount={upvote.upvoteCount()}
																			isUpvoted={upvote.isUpvoted()}
																			upvoteDisabled={upvote.isDisabled()}
																			onUpvote={upvote.toggle}
																			onRemove={
																				isOwner()
																					? () => setRemovePackageId(pkg.id)
																					: undefined
																			}
																		/>
																	);
																}}
															</For>
														</div>
													</Stack>
												</Show>
											</Stack>
										</Show>
									</Stack>
								</>
							)}
						</Show>
					</Show>
				</Stack>
			</Container>

			{/* Delete Project Dialog */}
			<AlertDialog
				open={deleteDialogOpen()}
				onOpenChange={setDeleteDialogOpen}
				title="Delete Project"
				description={`Delete "${project()?.name}"? This cannot be undone.`}
				confirmText="Delete"
				variant="danger"
				onConfirm={confirmDelete}
			/>

			{/* Remove Package Dialog */}
			<AlertDialog
				open={removePackageId() !== null}
				onOpenChange={(open) => {
					if (!open) setRemovePackageId(null);
				}}
				title="Remove Package"
				description="Remove this package from the project?"
				confirmText="Remove"
				variant="danger"
				onConfirm={confirmRemovePackage}
			/>
		</Layout>
	);
};

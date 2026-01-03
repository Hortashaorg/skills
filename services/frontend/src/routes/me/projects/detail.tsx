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
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { createPackageUpvote } from "@/hooks/createPackageUpvote";
import { Layout } from "@/layout/Layout";
import { buildPackageUrl } from "@/lib/url";

type Package = Row["packages"] & {
	upvotes?: readonly Row["packageUpvotes"][];
};

export const ProjectDetail = () => {
	const params = useParams<{ id: string }>();
	const navigate = useNavigate();
	const zero = useZero();

	const [project, projectResult] = useQuery(() =>
		queries.projects.byId({ id: params.id }),
	);

	const [isEditingName, setIsEditingName] = createSignal(false);
	const [isEditingDescription, setIsEditingDescription] = createSignal(false);
	const [editName, setEditName] = createSignal("");
	const [editDescription, setEditDescription] = createSignal("");
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

	const packageSearchResults = createMemo((): SearchResultItem[] => {
		const results = searchResults() ?? [];
		const existing = existingPackageIds();
		return results
			.filter((pkg) => !existing.has(pkg.id))
			.map((pkg) => ({
				id: pkg.id,
				primary: pkg.name,
				secondary: pkg.description ?? undefined,
				label: pkg.registry,
			}));
	});

	const handleAddPackage = async (item: SearchResultItem) => {
		const p = project();
		if (!p) return;

		try {
			await zero().mutate(
				mutators.projectPackages.add({
					projectId: p.id,
					packageId: item.id,
				}),
			).client;
			setPackageSearch("");
		} catch (err) {
			console.error("Failed to add package:", err);
			toast.error("Failed to add package. Please try again.");
		}
	};

	const startEditingName = () => {
		const p = project();
		if (p) {
			setEditName(p.name);
			setIsEditingName(true);
		}
	};

	const startEditingDescription = () => {
		const p = project();
		if (p) {
			setEditDescription(p.description ?? "");
			setIsEditingDescription(true);
		}
	};

	const saveName = async () => {
		const p = project();
		if (!p || !editName().trim()) return;

		try {
			await zero().mutate(
				mutators.projects.update({
					id: p.id,
					name: editName().trim(),
				}),
			).client;
			setIsEditingName(false);
		} catch (err) {
			console.error("Failed to update name:", err);
			toast.error("Failed to update name. Please try again.");
		}
	};

	const saveDescription = async () => {
		const p = project();
		if (!p) return;

		try {
			await zero().mutate(
				mutators.projects.update({
					id: p.id,
					description: editDescription().trim() || undefined,
				}),
			).client;
			setIsEditingDescription(false);
		} catch (err) {
			console.error("Failed to update description:", err);
			toast.error("Failed to update description. Please try again.");
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
					<Show
						when={!isLoading()}
						fallback={<Text color="muted">Loading...</Text>}
					>
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
									<Flex justify="between" align="start" gap="md">
										<Stack spacing="xs" class="flex-1">
											{/* Editable Name */}
											<Show
												when={isEditingName()}
												fallback={
													<Flex align="center" gap="sm">
														<Heading level="h1">{p().name}</Heading>
														<Show when={isOwner()}>
															<button
																type="button"
																onClick={startEditingName}
																class="text-on-surface-muted hover:text-on-surface dark:text-on-surface-dark-muted dark:hover:text-on-surface-dark transition p-1"
															>
																<PencilIcon size="sm" title="Edit name" />
															</button>
														</Show>
													</Flex>
												}
											>
												<Flex gap="sm" align="center">
													<input
														type="text"
														value={editName()}
														onInput={(e) => setEditName(e.currentTarget.value)}
														onKeyDown={(e) => {
															if (e.key === "Enter") saveName();
															if (e.key === "Escape") setIsEditingName(false);
														}}
														class="flex-1 px-2 py-1 text-2xl font-bold bg-surface-alt dark:bg-surface-dark-alt border border-outline dark:border-outline-dark rounded"
														autofocus
													/>
													<Button
														size="sm"
														variant="primary"
														onClick={saveName}
													>
														Save
													</Button>
													<Button
														size="sm"
														variant="secondary"
														onClick={() => setIsEditingName(false)}
													>
														Cancel
													</Button>
												</Flex>
											</Show>

											{/* Editable Description */}
											<Show
												when={isEditingDescription()}
												fallback={
													<Flex align="start" gap="sm">
														<Show
															when={p().description}
															fallback={
																<Show when={isOwner()}>
																	<button
																		type="button"
																		onClick={startEditingDescription}
																		class="text-on-surface-muted dark:text-on-surface-dark-muted hover:text-on-surface dark:hover:text-on-surface-dark transition text-sm"
																	>
																		+ Add description
																	</button>
																</Show>
															}
														>
															<Text color="muted">{p().description}</Text>
															<Show when={isOwner()}>
																<button
																	type="button"
																	onClick={startEditingDescription}
																	class="text-on-surface-muted hover:text-on-surface dark:text-on-surface-dark-muted dark:hover:text-on-surface-dark transition p-1 shrink-0"
																>
																	<PencilIcon
																		size="sm"
																		title="Edit description"
																	/>
																</button>
															</Show>
														</Show>
													</Flex>
												}
											>
												<Stack spacing="sm">
													<textarea
														value={editDescription()}
														onInput={(e) =>
															setEditDescription(e.currentTarget.value)
														}
														onKeyDown={(e) => {
															if (e.key === "Escape")
																setIsEditingDescription(false);
														}}
														rows={3}
														class="w-full px-2 py-1 text-sm bg-surface-alt dark:bg-surface-dark-alt border border-outline dark:border-outline-dark rounded resize-none"
														placeholder="Add a description..."
														autofocus
													/>
													<Flex gap="sm">
														<Button
															size="sm"
															variant="primary"
															onClick={saveDescription}
														>
															Save
														</Button>
														<Button
															size="sm"
															variant="secondary"
															onClick={() => setIsEditingDescription(false)}
														>
															Cancel
														</Button>
													</Flex>
												</Stack>
											</Show>

											<Text size="sm" color="muted">
												Created by{" "}
												{p().account?.name ?? p().account?.email ?? "Unknown"}
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
												noResultsMessage="No matching packages found"
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

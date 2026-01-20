import { mutators, queries, useQuery, useZero } from "@package/database/client";
import { A, useNavigate, useParams } from "@solidjs/router";
import { createMemo, createSignal, Show } from "solid-js";
import {
	SearchInput,
	type SearchResultItem,
} from "@/components/composite/search-input";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Layout } from "@/layout/Layout";
import { PACKAGE_SEARCH_LIMIT } from "@/lib/constants";
import { handleMutationError } from "@/lib/mutation-error";
import { EcosystemGrid } from "./sections/EcosystemGrid";
import { PackageGrid } from "./sections/PackageGrid";
import { ProjectDetailSkeleton } from "./sections/ProjectDetailSkeleton";
import { ProjectEditForm } from "./sections/ProjectEditForm";
import { ProjectHeader } from "./sections/ProjectHeader";

const SEARCH_PACKAGES_PREFIX = "SEARCH_PACKAGES:";
const SEARCH_ECOSYSTEMS_PREFIX = "SEARCH_ECOSYSTEMS:";

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
	const [removeEcosystemId, setRemoveEcosystemId] = createSignal<string | null>(
		null,
	);
	const [activeTab, setActiveTab] = createSignal<"packages" | "ecosystems">(
		"packages",
	);
	const [ecosystemSearch, setEcosystemSearch] = createSignal("");

	// Search for packages to add
	const [searchResults, searchResultsStatus] = useQuery(() =>
		queries.packages.search({
			query: packageSearch() || undefined,
			limit: PACKAGE_SEARCH_LIMIT,
		}),
	);

	// Exact matches query - returns all packages with exact name across registries
	const [exactMatchResults] = useQuery(() =>
		queries.packages.exactMatches({
			name: packageSearch().trim(),
		}),
	);

	// Search for ecosystems to add
	const [ecosystemSearchResults, ecosystemSearchResultsStatus] = useQuery(() =>
		queries.ecosystems.search({
			query: ecosystemSearch() || undefined,
			limit: 20,
		}),
	);

	const isLoading = () => projectResult().type !== "complete";
	const isSearching = () =>
		searchResultsStatus().type !== "complete" && packageSearch().length > 0;
	const isSearchingEcosystems = () =>
		ecosystemSearchResultsStatus().type !== "complete" &&
		ecosystemSearch().length > 0;
	const isOwner = () => {
		const p = project();
		return !!(p && zero().userID !== "anon" && p.accountId === zero().userID);
	};

	const packages = createMemo(() => {
		const p = project();
		if (!p) return [];
		return p.projectPackages
			.map((pp) => pp.package)
			.filter((pkg) => pkg != null);
	});

	const existingPackageIds = createMemo(
		() => new Set(packages().map((p) => p.id)),
	);

	// Group packages by tag - packages with multiple tags appear in multiple groups
	const packagesByTag = createMemo(() => {
		const pkgs = packages();
		type Pkg = (typeof pkgs)[number];
		const groups: Record<string, Pkg[]> = {};
		const uncategorized: Pkg[] = [];

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

	// Ecosystems
	const ecosystems = createMemo(() => {
		const p = project();
		if (!p) return [];
		return (p.projectEcosystems ?? [])
			.map((pe) => pe.ecosystem)
			.filter((eco) => eco != null);
	});

	const existingEcosystemIds = createMemo(
		() => new Set(ecosystems().map((e) => e.id)),
	);

	// Group ecosystems by tag
	const ecosystemsByTag = createMemo(() => {
		const ecos = ecosystems();
		type Eco = (typeof ecos)[number];
		const groups: Record<string, Eco[]> = {};
		const uncategorized: Eco[] = [];

		for (const eco of ecos) {
			const tags = eco.ecosystemTags ?? [];
			if (tags.length === 0) {
				uncategorized.push(eco);
			} else {
				for (const et of tags) {
					const tagName = et.tag?.name;
					if (tagName) {
						if (!groups[tagName]) {
							groups[tagName] = [];
						}
						groups[tagName].push(eco);
					}
				}
			}
		}

		const sortedTags = Object.keys(groups).sort((a, b) =>
			a.toLowerCase().localeCompare(b.toLowerCase()),
		);

		return { groups, sortedTags, uncategorized };
	});

	const ecosystemSearchResultsFiltered = createMemo((): SearchResultItem[] => {
		const results = ecosystemSearchResults() ?? [];
		const existing = existingEcosystemIds();
		const searchTerm = ecosystemSearch().trim();
		const items: SearchResultItem[] = [];

		for (const eco of results) {
			if (existing.has(eco.id)) continue;
			items.push({
				id: eco.id,
				primary: eco.name,
				secondary: eco.description ?? undefined,
				label: "ecosystem",
			});
		}

		// Add "search on ecosystems page" option when no results
		if (items.length === 0 && searchTerm.length > 0) {
			items.push({
				id: `${SEARCH_ECOSYSTEMS_PREFIX}${searchTerm}`,
				primary: `Search "${searchTerm}" on Ecosystems page`,
				secondary: "Browse all ecosystems there",
				label: "→",
				isAction: true,
			});
		}

		return items;
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
		return pkg.registry;
	};

	const packageSearchResults = createMemo((): SearchResultItem[] => {
		const results = searchResults() ?? [];
		const existing = existingPackageIds();
		const exactMatches = exactMatchResults() ?? [];
		const searchTerm = packageSearch().trim();
		const items: SearchResultItem[] = [];
		const exactIds = new Set(exactMatches.map((p) => p.id));

		// Add all exact matches first (sorted by upvotes from query)
		for (const exact of exactMatches) {
			if (existing.has(exact.id)) continue;
			items.push({
				id: exact.id,
				primary: exact.name,
				secondary: getPackageSecondary(exact),
				label: getPackageLabel(exact),
			});
		}

		// Add "search on packages page" option when no exact matches
		if (exactMatches.length === 0 && searchTerm.length > 0) {
			items.push({
				id: `${SEARCH_PACKAGES_PREFIX}${searchTerm}`,
				primary: `Search "${searchTerm}" on Packages page`,
				secondary: "Request new packages there",
				label: "→",
				isAction: true,
			});
		}

		// Add rest of search results (excluding exact matches to avoid duplication)
		for (const pkg of results) {
			if (existing.has(pkg.id)) continue;
			if (exactIds.has(pkg.id)) continue;
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
				handleMutationError(err, "add package");
			});
	};

	const handleAddEcosystem = (item: SearchResultItem) => {
		// Navigate to ecosystems page with search term
		if (item.id.startsWith(SEARCH_ECOSYSTEMS_PREFIX)) {
			const searchTerm = item.id.slice(SEARCH_ECOSYSTEMS_PREFIX.length);
			navigate(`/ecosystems?q=${encodeURIComponent(searchTerm)}`);
			return;
		}

		const p = project();
		if (!p) return;

		zero()
			.mutate(
				mutators.projectEcosystems.add({
					projectId: p.id,
					ecosystemId: item.id,
				}),
			)
			.client.then(() => {
				setEcosystemSearch("");
			})
			.catch((err) => {
				handleMutationError(err, "add ecosystem");
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
			handleMutationError(err, "update project");
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
			handleMutationError(err, "remove package");
		}
		setRemovePackageId(null);
	};

	const confirmRemoveEcosystem = async () => {
		const p = project();
		const ecosystemId = removeEcosystemId();
		if (!p || !ecosystemId) return;

		const projectEcosystem = (p.projectEcosystems ?? []).find(
			(pe) => pe.ecosystemId === ecosystemId,
		);
		if (!projectEcosystem) return;

		try {
			await zero().mutate(
				mutators.projectEcosystems.remove({
					id: projectEcosystem.id,
					projectId: p.id,
				}),
			).client;
		} catch (err) {
			handleMutationError(err, "remove ecosystem");
		}
		setRemoveEcosystemId(null);
	};

	const confirmDelete = async () => {
		const p = project();
		if (!p) return;

		try {
			await zero().mutate(mutators.projects.remove({ id: p.id })).client;
			navigate("/me/projects");
		} catch (err) {
			handleMutationError(err, "delete project");
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
											<ProjectHeader
												project={p()}
												isOwner={isOwner()}
												onEdit={startEditing}
												onDelete={() => setDeleteDialogOpen(true)}
											/>
										}
									>
										<ProjectEditForm
											name={editName()}
											description={editDescription()}
											isSaving={isSaving()}
											onNameChange={setEditName}
											onDescriptionChange={setEditDescription}
											onSave={saveProject}
											onCancel={cancelEditing}
										/>
									</Show>

									<Card class="overflow-hidden">
										<Tabs.Root
											value={activeTab()}
											onChange={(v) =>
												setActiveTab(v as "packages" | "ecosystems")
											}
										>
											<Tabs.List variant="contained">
												<Tabs.Trigger value="packages" variant="contained">
													Packages ({packages().length})
												</Tabs.Trigger>
												<Tabs.Trigger value="ecosystems" variant="contained">
													Ecosystems ({ecosystems().length})
												</Tabs.Trigger>
											</Tabs.List>
										</Tabs.Root>

										<div class="p-4">
											<Show
												when={activeTab() === "packages"}
												fallback={
													<Stack spacing="md">
														<Show when={isOwner()}>
															<SearchInput
																value={ecosystemSearch()}
																onValueChange={setEcosystemSearch}
																results={ecosystemSearchResultsFiltered()}
																isLoading={isSearchingEcosystems()}
																onSelect={handleAddEcosystem}
																placeholder="Search ecosystems to add..."
															/>
														</Show>
														<EcosystemGrid
															ecosystems={ecosystems()}
															ecosystemsByTag={ecosystemsByTag()}
															isOwner={isOwner()}
															onRemove={setRemoveEcosystemId}
														/>
													</Stack>
												}
											>
												<Stack spacing="md">
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
													<PackageGrid
														packages={packages()}
														packagesByTag={packagesByTag()}
														isOwner={isOwner()}
														onRemove={setRemovePackageId}
													/>
												</Stack>
											</Show>
										</div>
									</Card>
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

			{/* Remove Ecosystem Dialog */}
			<AlertDialog
				open={removeEcosystemId() !== null}
				onOpenChange={(open) => {
					if (!open) setRemoveEcosystemId(null);
				}}
				title="Remove Ecosystem"
				description="Remove this ecosystem from the project?"
				confirmText="Remove"
				variant="danger"
				onConfirm={confirmRemoveEcosystem}
			/>
		</Layout>
	);
};

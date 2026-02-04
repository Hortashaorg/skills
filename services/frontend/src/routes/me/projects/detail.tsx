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
import { useEcosystemSearch } from "@/hooks/ecosystems";
import { usePackageSearch } from "@/hooks/packages";
import { useModalState } from "@/hooks/useModalState";
import { Layout } from "@/layout/Layout";
import { groupByTags } from "@/lib/group-by-tags";
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
	const deleteModal = useModalState();
	const removePackageModal = useModalState<string>();
	const removeEcosystemModal = useModalState<string>();
	const [activeTab, setActiveTab] = createSignal<"packages" | "ecosystems">(
		"packages",
	);

	// Package search hook
	const packageSearch = usePackageSearch({ showRecentWhenEmpty: false });

	// Ecosystem search hook
	const ecosystemSearch = useEcosystemSearch({ showRecentWhenEmpty: false });

	const isLoading = () => projectResult().type !== "complete";
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
	const packagesByTag = createMemo(() =>
		groupByTags(packages(), (pkg) => pkg.packageTags),
	);

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
	const ecosystemsByTag = createMemo(() =>
		groupByTags(ecosystems(), (eco) => eco.ecosystemTags),
	);

	const ecosystemSearchResultsFiltered = createMemo((): SearchResultItem[] => {
		const results = ecosystemSearch.results();
		const exactMatch = ecosystemSearch.exactMatch();
		const existing = existingEcosystemIds();
		const searchTerm = ecosystemSearch.query().trim();
		const items: SearchResultItem[] = [];

		// Add exact match first if exists and not already in project
		if (exactMatch && !existing.has(exactMatch.id)) {
			items.push({
				id: exactMatch.id,
				primary: exactMatch.name,
				secondary: exactMatch.description ?? undefined,
				label: "exact match",
			});
		}

		// Add "search on ecosystems page" option when no exact match
		if (!exactMatch && searchTerm.length > 0) {
			items.push({
				id: `${SEARCH_ECOSYSTEMS_PREFIX}${searchTerm}`,
				primary: `Search "${searchTerm}" on Ecosystems page`,
				secondary: "Suggest new ecosystems there",
				label: "→",
				isAction: true,
			});
		}

		// Add other results
		for (const eco of results) {
			if (existing.has(eco.id)) continue;
			// Skip if already added as exact match
			if (exactMatch && eco.id === exactMatch.id) continue;
			items.push({
				id: eco.id,
				primary: eco.name,
				secondary: eco.description ?? undefined,
				label: "ecosystem",
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
		const existing = existingPackageIds();
		const exactMatches = packageSearch.exactMatches();
		const results = packageSearch.results();
		const searchTerm = packageSearch.query().trim();
		const items: SearchResultItem[] = [];

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

		// Add rest of search results (already deduplicated by hook)
		for (const pkg of results) {
			if (existing.has(pkg.id)) continue;
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
				packageSearch.setQuery("");
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
				ecosystemSearch.setQuery("");
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
					description: editDescription(),
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
		const packageId = removePackageModal.data();
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
		removePackageModal.close();
	};

	const confirmRemoveEcosystem = async () => {
		const p = project();
		const ecosystemId = removeEcosystemModal.data();
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
		removeEcosystemModal.close();
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
												onDelete={() => deleteModal.open()}
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

									<Tabs.Root
										value={activeTab()}
										onChange={(v) =>
											setActiveTab(v as "packages" | "ecosystems")
										}
									>
										<Tabs.List variant="line">
											<Tabs.Trigger value="packages" variant="line">
												Packages ({packages().length})
											</Tabs.Trigger>
											<Tabs.Trigger value="ecosystems" variant="line">
												Ecosystems ({ecosystems().length})
											</Tabs.Trigger>
										</Tabs.List>
									</Tabs.Root>

									<Show
										when={activeTab() === "packages"}
										fallback={
											<Stack spacing="md" class="mt-4">
												<Show when={isOwner()}>
													<SearchInput
														value={ecosystemSearch.query()}
														onValueChange={ecosystemSearch.setQuery}
														results={ecosystemSearchResultsFiltered()}
														isLoading={ecosystemSearch.isLoading()}
														onSelect={handleAddEcosystem}
														placeholder="Search ecosystems to add..."
													/>
												</Show>
												<EcosystemGrid
													ecosystems={ecosystems()}
													ecosystemsByTag={ecosystemsByTag()}
													isOwner={isOwner()}
													onRemove={removeEcosystemModal.open}
												/>
											</Stack>
										}
									>
										<Stack spacing="md" class="mt-4">
											<Show when={isOwner()}>
												<SearchInput
													value={packageSearch.query()}
													onValueChange={packageSearch.setQuery}
													results={packageSearchResults()}
													isLoading={packageSearch.isLoading()}
													onSelect={handleAddPackage}
													placeholder="Search packages to add..."
												/>
											</Show>
											<PackageGrid
												packages={packages()}
												packagesByTag={packagesByTag()}
												isOwner={isOwner()}
												onRemove={removePackageModal.open}
											/>
										</Stack>
									</Show>
								</>
							)}
						</Show>
					</Show>
				</Stack>
			</Container>

			{/* Delete Project Dialog */}
			<AlertDialog
				open={deleteModal.isOpen()}
				onOpenChange={(open) => !open && deleteModal.close()}
				title="Delete Project"
				description={`Delete "${project()?.name}"? This cannot be undone.`}
				confirmText="Delete"
				variant="danger"
				onConfirm={confirmDelete}
			/>

			{/* Remove Package Dialog */}
			<AlertDialog
				open={removePackageModal.isOpen()}
				onOpenChange={(open) => !open && removePackageModal.close()}
				title="Remove Package"
				description="Remove this package from the project?"
				confirmText="Remove"
				variant="danger"
				onConfirm={confirmRemovePackage}
			/>

			{/* Remove Ecosystem Dialog */}
			<AlertDialog
				open={removeEcosystemModal.isOpen()}
				onOpenChange={(open) => !open && removeEcosystemModal.close()}
				title="Remove Ecosystem"
				description="Remove this ecosystem from the project?"
				confirmText="Remove"
				variant="danger"
				onConfirm={confirmRemoveEcosystem}
			/>
		</Layout>
	);
};

export default ProjectDetail;

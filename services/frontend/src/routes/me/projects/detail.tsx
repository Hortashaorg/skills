import { mutators, queries, useQuery, useZero } from "@package/database/client";
import { A, useNavigate, useParams } from "@solidjs/router";
import { createMemo, createSignal, Show } from "solid-js";
import {
	SearchInput,
	type SearchResultItem,
} from "@/components/composite/search-input";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Layout } from "@/layout/Layout";
import { PACKAGE_SEARCH_LIMIT } from "@/lib/constants";
import { handleMutationError } from "@/lib/mutation-error";
import { PackageGrid } from "./sections/PackageGrid";
import { ProjectDetailSkeleton } from "./sections/ProjectDetailSkeleton";
import { ProjectEditForm } from "./sections/ProjectEditForm";
import { ProjectHeader } from "./sections/ProjectHeader";

const SEARCH_PACKAGES_PREFIX = "SEARCH_PACKAGES:";

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
			limit: PACKAGE_SEARCH_LIMIT,
		}),
	);

	// Exact matches query - returns all packages with exact name across registries
	const [exactMatchResults] = useQuery(() =>
		queries.packages.exactMatches({
			name: packageSearch().trim(),
		}),
	);

	const isLoading = () => projectResult().type !== "complete";
	const isSearching = () =>
		searchResultsStatus().type !== "complete" && packageSearch().length > 0;
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

										<PackageGrid
											packages={packages()}
											packagesByTag={packagesByTag()}
											isOwner={isOwner()}
											onRemove={setRemovePackageId}
										/>
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

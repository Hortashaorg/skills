import {
	mutators,
	type ProjectStatus,
	queries,
	useQuery,
	useZero,
} from "@package/database/client";
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
import { useEcosystemSearch } from "@/hooks/ecosystems/useEcosystemSearch";
import { usePackageSearch } from "@/hooks/packages/usePackageSearch";
import { createClickOutside } from "@/hooks/useClickOutside";
import { useModalState } from "@/hooks/useModalState";
import { Layout } from "@/layout/Layout";
import { handleMutationError } from "@/lib/mutation-error";
import { ProjectDetailSkeleton } from "@/routes/me/projects/sections/ProjectDetailSkeleton";
import { CardPanel } from "./components/card-panel";
import {
	KanbanBoard,
	type KanbanCard,
	type KanbanColumn,
} from "./components/kanban-board";

const STATUS_LABELS: Record<ProjectStatus, string> = {
	aware: "Aware",
	evaluating: "Evaluating",
	trialing: "Trialing",
	approved: "Approved",
	adopted: "Adopted",
	rejected: "Rejected",
	phasing_out: "Phasing Out",
	dropped: "Dropped",
};

const ALL_STATUSES: ProjectStatus[] = [
	"aware",
	"evaluating",
	"trialing",
	"approved",
	"adopted",
	"rejected",
	"phasing_out",
	"dropped",
];

const SEARCH_PACKAGES_PREFIX = "SEARCH_PACKAGES:";
const SEARCH_ECOSYSTEMS_PREFIX = "SEARCH_ECOSYSTEMS:";

export const ProjectDetailV2 = () => {
	const params = useParams<{ id: string }>();
	const zero = useZero();
	const navigate = useNavigate();

	const [project, projectResult] = useQuery(() =>
		queries.projects.byId({ id: params.id }),
	);

	const isLoading = () => projectResult().type !== "complete";
	const isAnon = () => zero().userID === "anon";
	const isOwner = () => {
		const p = project();
		if (!p || isAnon()) return false;
		const members = p.projectMembers ?? [];
		return members.some(
			(m) => m.accountId === zero().userID && m.role === "owner",
		);
	};

	const sortedStatuses = createMemo(() => {
		const p = project();
		if (!p) return [];
		return [...(p.projectStatuses ?? [])].sort(
			(a, b) => a.position - b.position,
		);
	});

	const availableStatuses = createMemo((): ProjectStatus[] => {
		const active = new Set(sortedStatuses().map((s) => s.status));
		return ALL_STATUSES.filter((s) => !active.has(s as ProjectStatus));
	});

	const columns = createMemo((): KanbanColumn[] => {
		const p = project();
		if (!p) return [];

		const userId = zero().userID;
		const columnMap = new Map<ProjectStatus, KanbanCard[]>();

		for (const pp of p.projectPackages ?? []) {
			const status = pp.status as ProjectStatus;
			const pkg = pp.package;
			if (!pkg) continue;

			const tags =
				pkg.packageTags?.map((pt) => pt.tag?.name).filter(Boolean) ?? [];

			const card: KanbanCard = {
				id: pp.id,
				entityId: pkg.id,
				name: pkg.name,
				description: pkg.description ?? undefined,
				tags: tags as string[],
				kind: "package",
				registry: pkg.registry,
				upvoteCount: pkg.upvotes?.length ?? 0,
				isUpvoted: pkg.upvotes?.some((u) => u.accountId === userId) ?? false,
			};

			const existing = columnMap.get(status) ?? [];
			existing.push(card);
			columnMap.set(status, existing);
		}

		for (const pe of p.projectEcosystems ?? []) {
			const status = pe.status as ProjectStatus;
			const eco = pe.ecosystem;
			if (!eco) continue;

			const tags =
				eco.ecosystemTags?.map((et) => et.tag?.name).filter(Boolean) ?? [];

			const card: KanbanCard = {
				id: pe.id,
				entityId: eco.id,
				name: eco.name,
				description: eco.description ?? undefined,
				tags: tags as string[],
				kind: "ecosystem",
				upvoteCount: eco.upvotes?.length ?? 0,
				isUpvoted: eco.upvotes?.some((u) => u.accountId === userId) ?? false,
			};

			const existing = columnMap.get(status) ?? [];
			existing.push(card);
			columnMap.set(status, existing);
		}

		return sortedStatuses().map((ps) => ({
			id: ps.status as ProjectStatus,
			statusRecordId: ps.id,
			label: STATUS_LABELS[ps.status as ProjectStatus] ?? ps.status,
			cards: columnMap.get(ps.status as ProjectStatus) ?? [],
		}));
	});

	type SelectedCard = { card: KanbanCard; columnId: string };
	const [selectedCard, setSelectedCard] = createSignal<SelectedCard | null>(
		null,
	);
	const removeCardModal = useModalState<KanbanCard>();

	// Unified search for adding packages and ecosystems
	const packageSearch = usePackageSearch({ showRecentWhenEmpty: false });
	const ecosystemSearch = useEcosystemSearch({ showRecentWhenEmpty: false });

	const searchQuery = () => packageSearch.query();
	const setSearchQuery = (value: string) => {
		packageSearch.setQuery(value);
		ecosystemSearch.setQuery(value);
	};

	const existingPackageIds = createMemo(
		() => new Set((project()?.projectPackages ?? []).map((pp) => pp.packageId)),
	);
	const existingEcosystemIds = createMemo(
		() =>
			new Set((project()?.projectEcosystems ?? []).map((pe) => pe.ecosystemId)),
	);

	const searchResults = createMemo((): SearchResultItem[] => {
		const existing = existingPackageIds();
		const existingEco = existingEcosystemIds();
		const term = searchQuery().trim();
		if (!term) return [];

		const items: SearchResultItem[] = [];

		// Package exact matches first
		for (const exact of packageSearch.exactMatches()) {
			if (existing.has(exact.id)) continue;
			items.push({
				id: `pkg:${exact.id}`,
				primary: exact.name,
				secondary: exact.description ?? undefined,
				label: exact.registry,
			});
		}

		// Ecosystem exact match
		const ecoExact = ecosystemSearch.exactMatch();
		if (ecoExact && !existingEco.has(ecoExact.id)) {
			items.push({
				id: `eco:${ecoExact.id}`,
				primary: ecoExact.name,
				secondary: ecoExact.description ?? undefined,
				label: "ecosystem",
			});
		}

		// Package search results
		for (const pkg of packageSearch.results()) {
			if (existing.has(pkg.id)) continue;
			items.push({
				id: `pkg:${pkg.id}`,
				primary: pkg.name,
				secondary: pkg.description ?? undefined,
				label: pkg.registry,
			});
		}

		// Ecosystem search results
		for (const eco of ecosystemSearch.results()) {
			if (existingEco.has(eco.id)) continue;
			if (ecoExact && eco.id === ecoExact.id) continue;
			items.push({
				id: `eco:${eco.id}`,
				primary: eco.name,
				secondary: eco.description ?? undefined,
				label: "ecosystem",
			});
		}

		// Fallback actions if no results
		if (items.length === 0 && term.length > 0) {
			items.push({
				id: `${SEARCH_PACKAGES_PREFIX}${term}`,
				primary: `Search "${term}" on Packages page`,
				secondary: "Request new packages there",
				label: "→",
				isAction: true,
			});
			items.push({
				id: `${SEARCH_ECOSYSTEMS_PREFIX}${term}`,
				primary: `Search "${term}" on Ecosystems page`,
				secondary: "Suggest new ecosystems there",
				label: "→",
				isAction: true,
			});
		}

		return items;
	});

	const handleSearchSelect = (item: SearchResultItem) => {
		if (item.id.startsWith(SEARCH_PACKAGES_PREFIX)) {
			const term = item.id.slice(SEARCH_PACKAGES_PREFIX.length);
			navigate(`/packages?q=${encodeURIComponent(term)}`);
			return;
		}
		if (item.id.startsWith(SEARCH_ECOSYSTEMS_PREFIX)) {
			const term = item.id.slice(SEARCH_ECOSYSTEMS_PREFIX.length);
			navigate(`/ecosystems?q=${encodeURIComponent(term)}`);
			return;
		}

		const p = project();
		if (!p) return;

		if (item.id.startsWith("pkg:")) {
			const packageId = item.id.slice(4);
			zero().mutate(
				mutators.projectPackages.add({
					projectId: p.id,
					packageId,
				}),
			);
		} else if (item.id.startsWith("eco:")) {
			const ecosystemId = item.id.slice(4);
			zero().mutate(
				mutators.projectEcosystems.add({
					projectId: p.id,
					ecosystemId,
				}),
			);
		}

		setSearchQuery("");
	};

	let boardRef: HTMLElement | undefined;
	let panelRef: HTMLElement | undefined;

	createClickOutside({
		refs: () => [boardRef, panelRef],
		onClickOutside: () => setSelectedCard(null),
		enabled: () => selectedCard() !== null,
	});

	const handleCardClick = (card: KanbanCard, columnId: string) => {
		setSelectedCard({ card, columnId });
	};

	const handleCardMove = (
		cardId: string,
		_fromColumnId: string,
		toColumnId: string,
	) => {
		const p = project();
		if (!p) return;

		const newStatus = toColumnId as ProjectStatus;

		const pp = p.projectPackages?.find((pp) => pp.id === cardId);
		if (pp) {
			zero().mutate(
				mutators.projectPackages.updateStatus({
					id: cardId,
					projectId: p.id,
					status: newStatus,
				}),
			);
		}

		const pe = p.projectEcosystems?.find((pe) => pe.id === cardId);
		if (pe) {
			zero().mutate(
				mutators.projectEcosystems.updateStatus({
					id: cardId,
					projectId: p.id,
					status: newStatus,
				}),
			);
		}

		const sel = selectedCard();
		if (sel && sel.card.id === cardId) {
			setSelectedCard({ card: sel.card, columnId: toColumnId });
		}
	};

	const handleUpvote = async (card: KanbanCard) => {
		if (isAnon()) return;

		try {
			if (card.kind === "package") {
				if (card.isUpvoted) {
					const pkg = project()?.projectPackages?.find(
						(pp) => pp.id === card.id,
					)?.package;
					const upvote = pkg?.upvotes?.find(
						(u) => u.accountId === zero().userID,
					);
					if (upvote) {
						const res = await zero().mutate(
							mutators.packageUpvotes.remove({
								id: upvote.id,
								packageId: card.entityId,
							}),
						).client;
						if (res.type === "error") throw res.error;
					}
				} else {
					const res = await zero().mutate(
						mutators.packageUpvotes.create({ packageId: card.entityId }),
					).client;
					if (res.type === "error") throw res.error;
				}
			} else {
				if (card.isUpvoted) {
					const eco = project()?.projectEcosystems?.find(
						(pe) => pe.id === card.id,
					)?.ecosystem;
					const upvote = eco?.upvotes?.find(
						(u) => u.accountId === zero().userID,
					);
					if (upvote) {
						const res = await zero().mutate(
							mutators.ecosystemUpvotes.remove({
								id: upvote.id,
								ecosystemId: card.entityId,
							}),
						).client;
						if (res.type === "error") throw res.error;
					}
				} else {
					const res = await zero().mutate(
						mutators.ecosystemUpvotes.create({
							ecosystemId: card.entityId,
						}),
					).client;
					if (res.type === "error") throw res.error;
				}
			}
		} catch (err) {
			handleMutationError(err, "update upvote");
		}
	};

	const handleMoveColumn = (columnId: string, direction: "left" | "right") => {
		const p = project();
		if (!p) return;

		const cols = columns();
		const idx = cols.findIndex((c) => c.id === columnId);
		if (idx < 0) return;

		const swapIdx = direction === "left" ? idx - 1 : idx + 1;
		if (swapIdx < 0 || swapIdx >= cols.length) return;

		const a = cols[idx];
		const b = cols[swapIdx];
		if (!a?.statusRecordId || !b?.statusRecordId) return;

		zero().mutate(
			mutators.projectStatuses.swapPositions({
				projectId: p.id,
				statusIdA: a.statusRecordId,
				statusIdB: b.statusRecordId,
			}),
		);
	};

	const handleAddStatus = (status: ProjectStatus) => {
		const p = project();
		if (!p) return;

		zero().mutate(
			mutators.projectStatuses.add({
				projectId: p.id,
				status,
			}),
		);
	};

	const handleRemoveColumn = (columnId: string) => {
		const p = project();
		if (!p) return;

		const col = columns().find((c) => c.id === columnId);
		if (!col?.statusRecordId) return;

		if (col.cards.length > 0) return;

		zero().mutate(
			mutators.projectStatuses.remove({
				id: col.statusRecordId,
				projectId: p.id,
			}),
		);
	};

	const handleRemove = (card: KanbanCard) => {
		removeCardModal.open(card);
	};

	const confirmRemoveCard = async () => {
		const card = removeCardModal.data();
		const p = project();
		if (!card || !p) return;

		try {
			if (card.kind === "package") {
				const res = await zero().mutate(
					mutators.projectPackages.remove({
						id: card.id,
						projectId: p.id,
					}),
				).client;
				if (res.type === "error") throw res.error;
			} else {
				const res = await zero().mutate(
					mutators.projectEcosystems.remove({
						id: card.id,
						projectId: p.id,
					}),
				).client;
				if (res.type === "error") throw res.error;
			}
		} catch (err) {
			handleMutationError(err, "remove from project");
		}

		if (selectedCard()?.card.id === card.id) {
			setSelectedCard(null);
		}
		removeCardModal.close();
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
											href="/projects"
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
									<Card padding="sm">
										<div class="flex items-center justify-between">
											<Text color="muted" size="sm">
												Projects V2 (dev)
											</Text>
											<A
												href={`/projects-old/${params.id}`}
												class="text-sm text-blue-500 hover:underline"
											>
												Switch to V1
											</A>
										</div>
									</Card>
									<Heading level="h1">{p().name}</Heading>
									<Show when={isOwner()}>
										<SearchInput
											value={searchQuery()}
											onValueChange={setSearchQuery}
											results={searchResults()}
											isLoading={
												packageSearch.isLoading() || ecosystemSearch.isLoading()
											}
											onSelect={handleSearchSelect}
											placeholder="Search packages or ecosystems to add..."
										/>
									</Show>
									<Show
										when={columns().length > 0}
										fallback={
											<Card padding="lg">
												<Stack spacing="sm" align="center">
													<Text color="muted">
														No packages or ecosystems added yet.
													</Text>
													<Show when={isOwner()}>
														<Text size="sm" color="muted">
															Use the search above to add packages or
															ecosystems.
														</Text>
													</Show>
												</Stack>
											</Card>
										}
									>
										<KanbanBoard
											columns={columns()}
											readonly={!isOwner()}
											upvoteDisabled={isAnon()}
											availableStatuses={availableStatuses()}
											statusLabels={STATUS_LABELS}
											onCardMove={handleCardMove}
											onCardClick={handleCardClick}
											onUpvote={handleUpvote}
											onRemove={isOwner() ? handleRemove : undefined}
											onMoveColumn={handleMoveColumn}
											onAddStatus={handleAddStatus}
											onRemoveColumn={handleRemoveColumn}
											ref={(el) => {
												boardRef = el;
											}}
										/>
									</Show>
								</>
							)}
						</Show>
					</Show>
				</Stack>
			</Container>

			{/* Side panel */}
			<Show when={selectedCard()}>
				{(sel) => (
					<CardPanel
						card={sel().card}
						currentColumnId={sel().columnId}
						columns={columns()}
						readonly={!isOwner()}
						onStatusChange={handleCardMove}
						onClose={() => setSelectedCard(null)}
						ref={(el) => {
							panelRef = el;
						}}
					/>
				)}
			</Show>

			{/* Remove card confirmation */}
			<AlertDialog
				open={removeCardModal.isOpen()}
				onOpenChange={(open) => !open && removeCardModal.close()}
				title={`Remove ${removeCardModal.data()?.kind === "package" ? "Package" : "Ecosystem"}`}
				description={`Remove "${removeCardModal.data()?.name}" from this project? Its status and any project-specific notes will be lost.`}
				confirmText="Remove"
				variant="danger"
				onConfirm={confirmRemoveCard}
			/>
		</Layout>
	);
};

export default ProjectDetailV2;

import {
	mutators,
	type ProjectStatus,
	type QueryRowType,
	type queries,
	useZero,
} from "@package/database/client";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { createMemo, createSignal, Show } from "solid-js";
import {
	SearchInput,
	type SearchResultItem,
} from "@/components/composite/search-input";
import { LayoutGridIcon, ListIcon } from "@/components/primitives/icon";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { useEcosystemSearch } from "@/hooks/ecosystems/useEcosystemSearch";
import { usePackageSearch } from "@/hooks/packages/usePackageSearch";
import { createClickOutside } from "@/hooks/useClickOutside";
import { useModalState } from "@/hooks/useModalState";
import { ALL_PROJECT_STATUSES, PROJECT_STATUS_LABELS } from "@/lib/constants";
import { groupByTags } from "@/lib/group-by-tags";
import { handleMutationError } from "@/lib/mutation-error";
import { CardPanel } from "../components/card-panel";
import { KanbanBoard } from "../components/kanban-board";
import { type ListGroup, ListView } from "../components/list-view";
import type { KanbanCard, KanbanColumn } from "../types";

type ProjectData = NonNullable<QueryRowType<typeof queries.projects.byId>>;

const SEARCH_PACKAGES_PREFIX = "SEARCH_PACKAGES:";
const SEARCH_ECOSYSTEMS_PREFIX = "SEARCH_ECOSYSTEMS:";

type BoardSectionProps = {
	project: ProjectData;
	isOwner: boolean;
	isMember: boolean;
};

type ViewMode = "kanban" | "list";
type GroupBy = "status" | "tag";

export const BoardSection = (props: BoardSectionProps) => {
	const zero = useZero();
	const navigate = useNavigate();
	const isAnon = () => zero().userID === "anon";

	// View state from URL search params
	const [searchParams, setSearchParams] = useSearchParams();
	const viewMode = (): ViewMode =>
		searchParams.view === "list" ? "list" : "kanban";
	const groupBy = (): GroupBy =>
		searchParams.group === "tag" ? "tag" : "status";

	const setViewMode = (mode: ViewMode) =>
		setSearchParams({ view: mode === "kanban" ? undefined : mode });
	const setGroupBy = (group: GroupBy) =>
		setSearchParams({ group: group === "status" ? undefined : group });

	// Column derivation from project statuses
	const sortedStatuses = createMemo(() => {
		return [...(props.project.projectStatuses ?? [])].sort(
			(a, b) => a.position - b.position,
		);
	});

	const availableStatuses = createMemo((): ProjectStatus[] => {
		const active = new Set(sortedStatuses().map((s) => s.status));
		return ALL_PROJECT_STATUSES.filter((s) => !active.has(s as ProjectStatus));
	});

	// Flat list of all cards with status
	type CardWithStatus = KanbanCard & { status: ProjectStatus };
	const cards = createMemo((): CardWithStatus[] => {
		const userId = zero().userID;
		const result: CardWithStatus[] = [];

		for (const pp of props.project.projectPackages ?? []) {
			const pkg = pp.package;
			if (!pkg) continue;

			const tags =
				pkg.packageTags?.map((pt) => pt.tag?.name).filter(Boolean) ?? [];

			result.push({
				id: pp.id,
				entityId: pkg.id,
				name: pkg.name,
				description: pkg.description ?? undefined,
				tags: tags as string[],
				kind: "package",
				registry: pkg.registry,
				upvoteCount: pkg.upvotes?.length ?? 0,
				isUpvoted: pkg.upvotes?.some((u) => u.accountId === userId) ?? false,
				hasComments: !!pp.thread,
				status: pp.status as ProjectStatus,
			});
		}

		for (const pe of props.project.projectEcosystems ?? []) {
			const eco = pe.ecosystem;
			if (!eco) continue;

			const tags =
				eco.ecosystemTags?.map((et) => et.tag?.name).filter(Boolean) ?? [];

			result.push({
				id: pe.id,
				entityId: eco.id,
				name: eco.name,
				description: eco.description ?? undefined,
				tags: tags as string[],
				kind: "ecosystem",
				slug: eco.slug,
				upvoteCount: eco.upvotes?.length ?? 0,
				isUpvoted: eco.upvotes?.some((u) => u.accountId === userId) ?? false,
				hasComments: !!pe.thread,
				status: pe.status as ProjectStatus,
			});
		}

		return result;
	});

	// Group cards by status into kanban columns
	const columns = createMemo((): KanbanColumn[] => {
		const cardsByStatus = new Map<ProjectStatus, KanbanCard[]>();
		for (const card of cards()) {
			const existing = cardsByStatus.get(card.status) ?? [];
			existing.push(card);
			cardsByStatus.set(card.status, existing);
		}

		return sortedStatuses().map((ps) => ({
			id: ps.status as ProjectStatus,
			statusRecordId: ps.id,
			label: PROJECT_STATUS_LABELS[ps.status as ProjectStatus] ?? ps.status,
			cards: cardsByStatus.get(ps.status as ProjectStatus) ?? [],
		}));
	});

	// Group cards by tag
	const tagGroups = createMemo((): ListGroup[] => {
		const { groups, sortedTags, uncategorized } = groupByTags(cards(), (card) =>
			card.tags.map((name) => ({ tag: { name } })),
		);
		const result: ListGroup[] = sortedTags.map((tag) => ({
			id: `tag:${tag}`,
			label: tag,
			cards: groups[tag] ?? [],
		}));
		if (uncategorized.length > 0) {
			result.push({
				id: "tag:uncategorized",
				label: "Untagged",
				cards: uncategorized,
			});
		}
		return result;
	});

	// Unified groups for list view
	const groups = createMemo((): ListGroup[] => {
		if (groupBy() === "tag") return tagGroups();
		return columns().map((col) => ({
			id: col.id,
			label: col.label,
			cards: col.cards,
		}));
	});

	// Tag groups shaped as KanbanColumn[] for kanban + tag view
	const tagColumnsAsKanban = createMemo((): KanbanColumn[] =>
		tagGroups().map((g) => ({
			id: g.id as ProjectStatus,
			label: g.label,
			cards: g.cards,
		})),
	);

	const isTagGrouping = () => groupBy() === "tag";
	const hasCards = () => cards().length > 0 || columns().length > 0;

	// Card selection + side panel
	type SelectedCard = { card: KanbanCard; columnId: string };
	const [selectedCard, setSelectedCard] = createSignal<SelectedCard | null>(
		null,
	);
	const removeCardModal = useModalState<KanbanCard>();

	let boardRef: HTMLElement | undefined;
	let panelRef: HTMLElement | undefined;

	createClickOutside({
		refs: () => [boardRef, panelRef],
		onClickOutside: () => setSelectedCard(null),
		enabled: () => selectedCard() !== null,
	});

	// Unified search
	const packageSearch = usePackageSearch({ showRecentWhenEmpty: false });
	const ecosystemSearch = useEcosystemSearch({ showRecentWhenEmpty: false });

	const searchQuery = () => packageSearch.query();
	const setSearchQuery = (value: string) => {
		packageSearch.setQuery(value);
		ecosystemSearch.setQuery(value);
	};

	const existingPackageIds = createMemo(
		() =>
			new Set((props.project.projectPackages ?? []).map((pp) => pp.packageId)),
	);
	const existingEcosystemIds = createMemo(
		() =>
			new Set(
				(props.project.projectEcosystems ?? []).map((pe) => pe.ecosystemId),
			),
	);

	const searchResults = createMemo((): SearchResultItem[] => {
		const existing = existingPackageIds();
		const existingEco = existingEcosystemIds();
		const term = searchQuery().trim();
		if (!term) return [];

		const items: SearchResultItem[] = [];

		for (const exact of packageSearch.exactMatches()) {
			if (existing.has(exact.id)) continue;
			items.push({
				id: `pkg:${exact.id}`,
				primary: exact.name,
				secondary: exact.description ?? undefined,
				label: exact.registry,
			});
		}

		const ecoExact = ecosystemSearch.exactMatch();
		if (ecoExact && !existingEco.has(ecoExact.id)) {
			items.push({
				id: `eco:${ecoExact.id}`,
				primary: ecoExact.name,
				secondary: ecoExact.description ?? undefined,
				label: "ecosystem",
			});
		}

		for (const pkg of packageSearch.results()) {
			if (existing.has(pkg.id)) continue;
			items.push({
				id: `pkg:${pkg.id}`,
				primary: pkg.name,
				secondary: pkg.description ?? undefined,
				label: pkg.registry,
			});
		}

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

		if (items.length === 0 && term.length > 0) {
			items.push({
				id: `${SEARCH_PACKAGES_PREFIX}${term}`,
				primary: `Search "${term}" on Packages page`,
				secondary: "Request new packages there",
				label: "\u2192",
				isAction: true,
			});
			items.push({
				id: `${SEARCH_ECOSYSTEMS_PREFIX}${term}`,
				primary: `Search "${term}" on Ecosystems page`,
				secondary: "Suggest new ecosystems there",
				label: "\u2192",
				isAction: true,
			});
		}

		return items;
	});

	// Event handlers
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

		if (item.id.startsWith("pkg:")) {
			const packageId = item.id.slice(4);
			zero().mutate(
				mutators.projectPackages.add({
					projectId: props.project.id,
					packageId,
				}),
			);
		} else if (item.id.startsWith("eco:")) {
			const ecosystemId = item.id.slice(4);
			zero().mutate(
				mutators.projectEcosystems.add({
					projectId: props.project.id,
					ecosystemId,
				}),
			);
		}

		setSearchQuery("");
	};

	const handleCardClick = (card: KanbanCard, columnId: string) => {
		setSelectedCard({ card, columnId });
	};

	const handleCardMove = (
		cardId: string,
		_fromColumnId: string,
		toColumnId: string,
	) => {
		const newStatus = toColumnId as ProjectStatus;

		const pp = props.project.projectPackages?.find((pp) => pp.id === cardId);
		if (pp) {
			zero().mutate(
				mutators.projectPackages.updateStatus({
					id: cardId,
					projectId: props.project.id,
					status: newStatus,
				}),
			);
		}

		const pe = props.project.projectEcosystems?.find((pe) => pe.id === cardId);
		if (pe) {
			zero().mutate(
				mutators.projectEcosystems.updateStatus({
					id: cardId,
					projectId: props.project.id,
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
					const pkg = props.project.projectPackages?.find(
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
						mutators.packageUpvotes.create({
							packageId: card.entityId,
						}),
					).client;
					if (res.type === "error") throw res.error;
				}
			} else {
				if (card.isUpvoted) {
					const eco = props.project.projectEcosystems?.find(
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
				projectId: props.project.id,
				statusIdA: a.statusRecordId,
				statusIdB: b.statusRecordId,
			}),
		);
	};

	const handleAddStatus = (status: ProjectStatus) => {
		zero().mutate(
			mutators.projectStatuses.add({
				projectId: props.project.id,
				status,
			}),
		);
	};

	const handleRemoveColumn = (columnId: string) => {
		const col = columns().find((c) => c.id === columnId);
		if (!col?.statusRecordId) return;
		if (col.cards.length > 0) return;

		zero().mutate(
			mutators.projectStatuses.remove({
				id: col.statusRecordId,
				projectId: props.project.id,
			}),
		);
	};

	const handleRemove = (card: KanbanCard) => {
		removeCardModal.open(card);
	};

	const confirmRemoveCard = async () => {
		const card = removeCardModal.data();
		if (!card) return;

		try {
			if (card.kind === "package") {
				const res = await zero().mutate(
					mutators.projectPackages.remove({
						id: card.id,
						projectId: props.project.id,
					}),
				).client;
				if (res.type === "error") throw res.error;
			} else {
				const res = await zero().mutate(
					mutators.projectEcosystems.remove({
						id: card.id,
						projectId: props.project.id,
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
		<>
			{/* Toolbar: search + view controls */}
			<div class="flex flex-wrap items-center gap-3">
				<Show when={props.isMember}>
					<div class="min-w-48 max-w-sm flex-1">
						<SearchInput
							value={searchQuery()}
							onValueChange={setSearchQuery}
							results={searchResults()}
							isLoading={
								packageSearch.isLoading() || ecosystemSearch.isLoading()
							}
							onSelect={handleSearchSelect}
							placeholder="Add packages or ecosystems..."
						/>
					</div>
				</Show>
				<div class="flex items-center gap-2 flex-1 justify-end">
					<div class="flex items-center h-8 rounded-lg border border-outline dark:border-outline-dark overflow-hidden">
						<button
							type="button"
							onClick={() => setViewMode("kanban")}
							class={`px-1.5 h-full flex items-center transition-colors cursor-pointer ${
								viewMode() === "kanban"
									? "bg-primary/10 dark:bg-primary-dark/10 text-primary dark:text-primary-dark"
									: "text-on-surface-muted dark:text-on-surface-dark-muted hover:bg-surface-alt dark:hover:bg-surface-dark-alt"
							}`}
							title="Kanban view"
						>
							<LayoutGridIcon size="sm" />
						</button>
						<button
							type="button"
							onClick={() => setViewMode("list")}
							class={`px-1.5 h-full flex items-center transition-colors cursor-pointer border-l border-outline dark:border-outline-dark ${
								viewMode() === "list"
									? "bg-primary/10 dark:bg-primary-dark/10 text-primary dark:text-primary-dark"
									: "text-on-surface-muted dark:text-on-surface-dark-muted hover:bg-surface-alt dark:hover:bg-surface-dark-alt"
							}`}
							title="List view"
						>
							<ListIcon size="sm" />
						</button>
					</div>
					<div class="flex items-center h-8 rounded-lg border border-outline dark:border-outline-dark overflow-hidden text-xs font-medium">
						<button
							type="button"
							onClick={() => setGroupBy("status")}
							class={`px-2.5 h-full flex items-center transition-colors cursor-pointer ${
								groupBy() === "status"
									? "bg-primary/10 dark:bg-primary-dark/10 text-primary dark:text-primary-dark"
									: "text-on-surface-muted dark:text-on-surface-dark-muted hover:bg-surface-alt dark:hover:bg-surface-dark-alt"
							}`}
						>
							Status
						</button>
						<button
							type="button"
							onClick={() => setGroupBy("tag")}
							class={`px-2.5 h-full flex items-center transition-colors cursor-pointer border-l border-outline dark:border-outline-dark ${
								groupBy() === "tag"
									? "bg-primary/10 dark:bg-primary-dark/10 text-primary dark:text-primary-dark"
									: "text-on-surface-muted dark:text-on-surface-dark-muted hover:bg-surface-alt dark:hover:bg-surface-dark-alt"
							}`}
						>
							Tags
						</button>
					</div>
				</div>
			</div>

			<Show
				when={hasCards()}
				fallback={
					<Card padding="lg">
						<Stack spacing="sm" align="center">
							<Text color="muted">No packages or ecosystems added yet.</Text>
							<Show when={props.isMember}>
								<Text size="sm" color="muted">
									Use the search above to add packages or ecosystems.
								</Text>
							</Show>
						</Stack>
					</Card>
				}
			>
				<Show
					when={viewMode() === "kanban"}
					fallback={
						<ListView
							groups={groups()}
							readonly={!props.isMember}
							upvoteDisabled={isAnon()}
							onCardClick={handleCardClick}
							onUpvote={handleUpvote}
							onRemove={props.isMember ? handleRemove : undefined}
						/>
					}
				>
					<KanbanBoard
						columns={isTagGrouping() ? tagColumnsAsKanban() : columns()}
						readonly={!props.isMember || isTagGrouping()}
						upvoteDisabled={isAnon()}
						availableStatuses={
							isTagGrouping() ? undefined : availableStatuses()
						}
						onCardMove={isTagGrouping() ? undefined : handleCardMove}
						onCardClick={handleCardClick}
						onUpvote={handleUpvote}
						onRemove={props.isMember ? handleRemove : undefined}
						onMoveColumn={
							!isTagGrouping() && props.isOwner ? handleMoveColumn : undefined
						}
						onAddStatus={
							!isTagGrouping() && props.isOwner ? handleAddStatus : undefined
						}
						onRemoveColumn={
							!isTagGrouping() && props.isOwner ? handleRemoveColumn : undefined
						}
						ref={(el) => {
							boardRef = el;
						}}
					/>
				</Show>
			</Show>

			{/* Side panel */}
			<Show when={selectedCard()}>
				{(sel) => (
					<CardPanel
						card={sel().card}
						currentColumnId={sel().columnId}
						columns={columns()}
						readonly={!props.isMember}
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
		</>
	);
};

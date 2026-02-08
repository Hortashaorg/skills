import {
	mutators,
	type ProjectStatus,
	type QueryRowType,
	type queries,
	useZero,
} from "@package/database/client";
import { useNavigate } from "@solidjs/router";
import { createMemo, createSignal, Show } from "solid-js";
import {
	SearchInput,
	type SearchResultItem,
} from "@/components/composite/search-input";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { useEcosystemSearch } from "@/hooks/ecosystems/useEcosystemSearch";
import { usePackageSearch } from "@/hooks/packages/usePackageSearch";
import { createClickOutside } from "@/hooks/useClickOutside";
import { useModalState } from "@/hooks/useModalState";
import { ALL_PROJECT_STATUSES, PROJECT_STATUS_LABELS } from "@/lib/constants";
import { handleMutationError } from "@/lib/mutation-error";
import { CardPanel } from "../components/card-panel";
import { KanbanBoard } from "../components/kanban-board";
import type { KanbanCard, KanbanColumn } from "../types";

type ProjectData = NonNullable<QueryRowType<typeof queries.projects.byId>>;

const SEARCH_PACKAGES_PREFIX = "SEARCH_PACKAGES:";
const SEARCH_ECOSYSTEMS_PREFIX = "SEARCH_ECOSYSTEMS:";

type BoardSectionProps = {
	project: ProjectData;
	isOwner: boolean;
};

export const BoardSection = (props: BoardSectionProps) => {
	const zero = useZero();
	const navigate = useNavigate();
	const isAnon = () => zero().userID === "anon";

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

	const columns = createMemo((): KanbanColumn[] => {
		const userId = zero().userID;
		const columnMap = new Map<ProjectStatus, KanbanCard[]>();

		for (const pp of props.project.projectPackages ?? []) {
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

		for (const pe of props.project.projectEcosystems ?? []) {
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
			label: PROJECT_STATUS_LABELS[ps.status as ProjectStatus] ?? ps.status,
			cards: columnMap.get(ps.status as ProjectStatus) ?? [],
		}));
	});

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
			<Show when={props.isOwner}>
				<SearchInput
					value={searchQuery()}
					onValueChange={setSearchQuery}
					results={searchResults()}
					isLoading={packageSearch.isLoading() || ecosystemSearch.isLoading()}
					onSelect={handleSearchSelect}
					placeholder="Search packages or ecosystems to add..."
				/>
			</Show>

			<Show
				when={columns().length > 0}
				fallback={
					<Card padding="lg">
						<Stack spacing="sm" align="center">
							<Text color="muted">No packages or ecosystems added yet.</Text>
							<Show when={props.isOwner}>
								<Text size="sm" color="muted">
									Use the search above to add packages or ecosystems.
								</Text>
							</Show>
						</Stack>
					</Card>
				}
			>
				<KanbanBoard
					columns={columns()}
					readonly={!props.isOwner}
					upvoteDisabled={isAnon()}
					availableStatuses={availableStatuses()}
					onCardMove={handleCardMove}
					onCardClick={handleCardClick}
					onUpvote={handleUpvote}
					onRemove={props.isOwner ? handleRemove : undefined}
					onMoveColumn={handleMoveColumn}
					onAddStatus={handleAddStatus}
					onRemoveColumn={handleRemoveColumn}
					ref={(el) => {
						boardRef = el;
					}}
				/>
			</Show>

			{/* Side panel */}
			<Show when={selectedCard()}>
				{(sel) => (
					<CardPanel
						card={sel().card}
						currentColumnId={sel().columnId}
						columns={columns()}
						readonly={!props.isOwner}
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

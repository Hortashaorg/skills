import {
	mutators,
	type ProjectStatus,
	queries,
	useQuery,
	useZero,
} from "@package/database/client";
import { A, useParams } from "@solidjs/router";
import { createMemo, createSignal, Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClickOutside } from "@/hooks/useClickOutside";
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

const STATUS_ORDER: ProjectStatus[] = [
	"aware",
	"evaluating",
	"trialing",
	"approved",
	"adopted",
	"rejected",
	"phasing_out",
	"dropped",
];

const DEFAULT_STATUSES: ProjectStatus[] = ["evaluating", "adopted", "dropped"];

export const ProjectDetailV2 = () => {
	const params = useParams<{ id: string }>();
	const zero = useZero();

	const [project, projectResult] = useQuery(() =>
		queries.projects.byId({ id: params.id }),
	);

	const isLoading = () => projectResult().type !== "complete";
	const isAnon = () => zero().userID === "anon";
	const isOwner = () => {
		const p = project();
		return p !== undefined && !isAnon() && p.accountId === zero().userID;
	};

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

		const visibleStatuses = STATUS_ORDER.filter(
			(s) => columnMap.has(s) || DEFAULT_STATUSES.includes(s),
		);

		return visibleStatuses.map((status) => ({
			id: status,
			label: STATUS_LABELS[status],
			cards: columnMap.get(status) ?? [],
		}));
	});

	type SelectedCard = { card: KanbanCard; columnId: string };
	const [selectedCard, setSelectedCard] = createSignal<SelectedCard | null>(
		null,
	);

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

	const handleRemove = async (card: KanbanCard) => {
		const p = project();
		if (!p) return;

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
									<Show
										when={columns().length > 0}
										fallback={
											<Card padding="lg">
												<Stack spacing="sm" align="center">
													<Text color="muted">
														No packages or ecosystems added yet.
													</Text>
													<Text size="sm" color="muted">
														Add packages or ecosystems from the V1 view to see
														them here.
													</Text>
												</Stack>
											</Card>
										}
									>
										<KanbanBoard
											columns={columns()}
											readonly={!isOwner()}
											upvoteDisabled={isAnon()}
											onCardMove={handleCardMove}
											onCardClick={handleCardClick}
											onUpvote={handleUpvote}
											onRemove={isOwner() ? handleRemove : undefined}
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
		</Layout>
	);
};

export default ProjectDetailV2;

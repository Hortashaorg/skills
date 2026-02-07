import { queries, useQuery } from "@package/database/client";
import { A, useParams } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClickOutside } from "@/hooks/useClickOutside";
import { Layout } from "@/layout/Layout";
import { ProjectDetailSkeleton } from "@/routes/me/projects/sections/ProjectDetailSkeleton";
import { CardPanel } from "./components/card-panel";
import {
	KanbanBoard,
	type KanbanCard,
	type KanbanColumn,
} from "./components/kanban-board";
import { mockColumns } from "./components/mock-data";

export const ProjectDetailV2 = () => {
	const params = useParams<{ id: string }>();

	const [project, projectResult] = useQuery(() =>
		queries.projects.byId({ id: params.id }),
	);

	const isLoading = () => projectResult().type !== "complete";

	const [columns, setColumns] = createSignal<KanbanColumn[]>(mockColumns);
	const [selectedCard, setSelectedCard] = createSignal<{
		card: KanbanCard;
		columnId: string;
	} | null>(null);

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
		fromColumnId: string,
		toColumnId: string,
	) => {
		setColumns((prev) => {
			const fromCol = prev.find((c) => c.id === fromColumnId);
			const card = fromCol?.cards.find((c) => c.id === cardId);
			if (!card) return prev;

			return prev.map((col) => {
				if (col.id === fromColumnId) {
					return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
				}
				if (col.id === toColumnId) {
					return { ...col, cards: [...col.cards, card] };
				}
				return col;
			});
		});

		// Keep panel in sync if the moved card is selected
		const sel = selectedCard();
		if (sel && sel.card.id === cardId) {
			setSelectedCard({ card: sel.card, columnId: toColumnId });
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
									<KanbanBoard
										columns={columns()}
										onCardMove={handleCardMove}
										onCardClick={handleCardClick}
										ref={(el) => {
											boardRef = el;
										}}
									/>
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

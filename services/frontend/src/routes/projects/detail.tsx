import { queries, useQuery, useZero } from "@package/database/client";
import { A, useParams } from "@solidjs/router";
import { Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Layout } from "@/layout/Layout";
import { ProjectDetailSkeleton } from "@/routes/me/projects/sections/ProjectDetailSkeleton";
import { BoardSection } from "./sections/BoardSection";

export const ProjectDetail = () => {
	const params = useParams<{ id: string }>();
	const zero = useZero();

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
									<Heading level="h1">{p().name}</Heading>
									<BoardSection project={p()} isOwner={isOwner()} />
								</>
							)}
						</Show>
					</Show>
				</Stack>
			</Container>
		</Layout>
	);
};

export default ProjectDetail;

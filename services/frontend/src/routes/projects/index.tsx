import { queries, useQuery } from "@package/database/client";
import { For, Show } from "solid-js";
import { SEO } from "@/components/composite/seo";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
import { Layout } from "@/layout/Layout";
import { ProjectCard } from "@/routes/me/projects/sections/ProjectCard";

export const BrowseProjects = () => {
	const [projects, projectsResult] = useQuery(() => queries.projects.list());

	const isLoading = () => projectsResult().type !== "complete";

	return (
		<Layout>
			<SEO
				title="Projects"
				description="Explore how others organize their tech stacks. Browse public projects and discover new tools."
			/>
			<Container size="lg">
				<Stack spacing="lg" class="py-8">
					<Stack spacing="sm" align="center">
						<Heading level="h1" class="text-center">
							Projects
						</Heading>
						<Text color="muted" class="text-center" as="p">
							Explore how others organize their tech stacks
						</Text>
					</Stack>

					<Show
						when={!isLoading()}
						fallback={<Text color="muted">Loading projects...</Text>}
					>
						<Show
							when={(projects()?.length ?? 0) > 0}
							fallback={
								<Card padding="lg">
									<Stack spacing="md" align="center">
										<Text color="muted">No projects yet.</Text>
										<Text size="sm" color="muted">
											Be the first to create a project!
										</Text>
									</Stack>
								</Card>
							}
						>
							<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								<For each={projects()}>
									{(project) => <ProjectCard project={project} showAuthor />}
								</For>
							</div>
						</Show>

						<Show when={(projects()?.length ?? 0) > 0}>
							<Text size="sm" color="muted" class="text-center">
								Showing {projects()?.length} projects
							</Text>
						</Show>
					</Show>
				</Stack>
			</Container>
		</Layout>
	);
};

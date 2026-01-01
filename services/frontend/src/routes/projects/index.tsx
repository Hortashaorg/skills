import { queries, useQuery, useZero } from "@package/database/client";
import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { AuthGuard } from "@/components/composite/auth-guard";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
import { Layout } from "@/layout/Layout";
import { ProjectCard } from "./sections/ProjectCard";

const buttonPrimaryClasses =
	"inline-block px-4 py-2 text-sm font-medium rounded-radius bg-primary border-primary text-on-primary hover:opacity-75 transition dark:bg-primary-dark dark:border-primary-dark dark:text-on-primary-dark";

export const Projects = () => {
	const zero = useZero();
	const isLoggedIn = () => zero().userID !== "anon";

	const [projects, projectsResult] = useQuery(() => queries.projects.mine());

	const isLoading = () => projectsResult().type !== "complete";
	const sortedProjects = () => projects() ?? [];

	return (
		<Layout>
			<Container size="lg">
				<Stack spacing="lg" class="py-8">
					<AuthGuard
						hasAccess={isLoggedIn()}
						fallback={
							<Card padding="lg">
								<Stack spacing="md" align="center">
									<Heading level="h2">Sign in to view your projects</Heading>
									<Text color="muted">
										Create projects to organize and track packages you're
										interested in.
									</Text>
								</Stack>
							</Card>
						}
					>
						<Flex justify="between" align="center">
							<Heading level="h1">My Projects</Heading>
							<A href="/projects/new" class={buttonPrimaryClasses}>
								New Project
							</A>
						</Flex>

						<Show
							when={!isLoading()}
							fallback={<Text color="muted">Loading...</Text>}
						>
							<Show
								when={sortedProjects().length > 0}
								fallback={
									<Card padding="lg">
										<Stack spacing="md" align="center">
											<Text color="muted">
												You don't have any projects yet.
											</Text>
											<A href="/projects/new" class={buttonPrimaryClasses}>
												Create your first project
											</A>
										</Stack>
									</Card>
								}
							>
								<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									<For each={sortedProjects()}>
										{(project) => <ProjectCard project={project} />}
									</For>
								</div>
							</Show>
						</Show>

						<Show when={sortedProjects().length > 0}>
							<Text size="sm" color="muted">
								{sortedProjects().length} project
								{sortedProjects().length !== 1 ? "s" : ""}
							</Text>
						</Show>
					</AuthGuard>
				</Stack>
			</Container>
		</Layout>
	);
};

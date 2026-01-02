import { queries, useQuery } from "@package/database/client";
import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
import { Layout } from "@/layout/Layout";

export const BrowseProjects = () => {
	const [projects, projectsResult] = useQuery(() => queries.projects.list());

	const isLoading = () => projectsResult().type !== "complete";

	return (
		<Layout>
			<Container size="lg">
				<Stack spacing="lg" class="py-8">
					{/* Header */}
					<Stack spacing="sm" align="center">
						<Heading level="h1" class="text-center">
							Projects
						</Heading>
						<Text color="muted" class="text-center" as="p">
							Explore how others organize their tech stacks
						</Text>
					</Stack>

					{/* Projects Grid */}
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
									{(project) => (
										<A href={`/projects/${project.id}`}>
											<Card
												padding="md"
												class="h-full hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition-colors cursor-pointer"
											>
												<Stack spacing="sm">
													<Text weight="semibold" class="truncate">
														{project.name}
													</Text>
													<Show when={project.description}>
														<Text size="sm" color="muted" class="line-clamp-2">
															{project.description}
														</Text>
													</Show>
													<Flex
														justify="between"
														align="center"
														class="pt-2 border-t border-outline/50 dark:border-outline-dark/50"
													>
														<Text size="xs" color="muted">
															{project.projectPackages?.length ?? 0} package
															{(project.projectPackages?.length ?? 0) !== 1
																? "s"
																: ""}
														</Text>
														<Text size="xs" color="muted">
															by {project.account?.name || "Anonymous"}
														</Text>
													</Flex>
												</Stack>
											</Card>
										</A>
									)}
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

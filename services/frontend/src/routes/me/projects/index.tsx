import { queries, useQuery, useZero } from "@package/database/client";
import { A } from "@solidjs/router";
import { createEffect, For, Index, on, Show } from "solid-js";
import { AuthGuard } from "@/components/composite/auth-guard";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Input } from "@/components/primitives/input";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createUrlStringSignal } from "@/hooks/createUrlSignal";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Layout } from "@/layout/Layout";
import {
	PROJECTS_AUTO_LOAD_LIMIT,
	PROJECTS_INITIAL_LIMIT,
	PROJECTS_LOAD_MORE_COUNT,
} from "@/lib/constants";
import { ProjectCard } from "./sections/ProjectCard";

const ProjectCardSkeleton = () => (
	<Card padding="md">
		<Stack spacing="sm">
			<Skeleton variant="text" width="60%" />
			<Skeleton variant="text" width="80%" />
			<Skeleton variant="text" width="40%" />
		</Stack>
	</Card>
);

export const Projects = () => {
	const zero = useZero();
	const isLoggedIn = () => zero().userID !== "anon";

	const [searchValue, setSearchValue] = createUrlStringSignal("q");
	const searchTerm = () => searchValue().trim();

	// Infinite scroll state
	const scroll = useInfiniteScroll({
		initialLimit: PROJECTS_INITIAL_LIMIT,
		loadMoreCount: PROJECTS_LOAD_MORE_COUNT,
		autoLoadLimit: PROJECTS_AUTO_LOAD_LIMIT,
	});

	// Reset limit when search changes
	createEffect(on([searchValue], () => scroll.resetLimit()));

	const [projects, projectsResult] = useQuery(() =>
		queries.projects.mine({
			query: searchTerm() || undefined,
			limit: scroll.limit(),
		}),
	);

	const isLoading = () => projectsResult().type !== "complete";
	const projectCount = () => projects()?.length ?? 0;
	const canLoadMore = () => scroll.canLoadMore(projectCount());
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
						<Flex justify="between" align="center" wrap="wrap" gap="md">
							<Heading level="h1">My Projects</Heading>
							<A href="/me/projects/new" class={buttonVariants()}>
								New Project
							</A>
						</Flex>

						<Input
							type="text"
							value={searchValue()}
							onInput={(e) => setSearchValue(e.currentTarget.value)}
							placeholder="Search projects..."
							aria-label="Search projects"
						/>

						{/* Initial loading skeleton */}
						<Show when={isLoading() && projectCount() === 0}>
							<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								<Index each={Array(6)}>{() => <ProjectCardSkeleton />}</Index>
							</div>
						</Show>

						{/* Results */}
						<Show when={!isLoading() || projectCount() > 0}>
							<Show
								when={sortedProjects().length > 0}
								fallback={
									<Card padding="lg">
										<Stack spacing="md" align="center">
											<Text color="muted">
												{searchTerm()
													? `No projects matching "${searchTerm()}"`
													: "You don't have any projects yet."}
											</Text>
											<Show when={!searchTerm()}>
												<A href="/me/projects/new" class={buttonVariants()}>
													Create your first project
												</A>
											</Show>
										</Stack>
									</Card>
								}
							>
								<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									<For each={sortedProjects()}>
										{(project) => <ProjectCard project={project} />}
									</For>

									{/* Auto-load skeletons */}
									<Show when={canLoadMore() && !scroll.pastAutoLoadLimit()}>
										<Index each={Array(6)}>
											{() => <ProjectCardSkeleton />}
										</Index>
									</Show>
								</div>

								{/* Manual load more button */}
								<Show when={canLoadMore() && scroll.pastAutoLoadLimit()}>
									<div class="flex justify-center pt-4">
										<Button variant="outline" onClick={scroll.loadMore}>
											Load more projects
										</Button>
									</div>
								</Show>

								{/* Sentinel for intersection observer */}
								<div ref={scroll.setSentinelRef} class="h-1" />

								{/* Back to top button */}
								<Show when={scroll.showBackToTop()}>
									<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
										<Button
											variant="info"
											size="md"
											onClick={scroll.scrollToTop}
										>
											↑ Back to top
										</Button>
									</div>
								</Show>
							</Show>
						</Show>
					</AuthGuard>
				</Stack>
			</Container>
		</Layout>
	);
};

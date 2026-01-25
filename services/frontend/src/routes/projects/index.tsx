import { queries, useQuery } from "@package/database/client";
import { createEffect, For, Index, on, Show } from "solid-js";
import { SEO } from "@/components/composite/seo";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Input } from "@/components/primitives/input";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { createUrlStringSignal } from "@/hooks/createUrlSignal";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Layout } from "@/layout/Layout";
import {
	PROJECTS_AUTO_LOAD_LIMIT,
	PROJECTS_INITIAL_LIMIT,
	PROJECTS_LOAD_MORE_COUNT,
} from "@/lib/constants";
import { ProjectCard } from "@/routes/me/projects/sections/ProjectCard";

export const BrowseProjects = () => {
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
		queries.projects.list({
			query: searchTerm() || undefined,
			limit: scroll.limit(),
		}),
	);

	const isLoading = () => projectsResult().type !== "complete";
	const projectCount = () => projects()?.length ?? 0;
	const canLoadMore = () => scroll.canLoadMore(projectCount());

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
							<Index each={Array(6)}>{() => <SkeletonCard />}</Index>
						</div>
					</Show>

					{/* Results */}
					<Show when={!isLoading() || projectCount() > 0}>
						<Show
							when={projectCount() > 0}
							fallback={
								<Card padding="lg">
									<Stack spacing="md" align="center">
										<Text color="muted">
											{searchTerm()
												? `No projects matching "${searchTerm()}"`
												: "No projects yet."}
										</Text>
										<Show when={!searchTerm()}>
											<Text size="sm" color="muted">
												Be the first to create a project!
											</Text>
										</Show>
									</Stack>
								</Card>
							}
						>
							<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								<For each={projects()}>
									{(project) => <ProjectCard project={project} showAuthor />}
								</For>

								{/* Auto-load skeletons */}
								<Show when={canLoadMore() && !scroll.pastAutoLoadLimit()}>
									<Index each={Array(6)}>{() => <SkeletonCard />}</Index>
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
									<Button variant="info" size="md" onClick={scroll.scrollToTop}>
										↑ Back to top
									</Button>
								</div>
							</Show>
						</Show>
					</Show>
				</Stack>
			</Container>
		</Layout>
	);
};

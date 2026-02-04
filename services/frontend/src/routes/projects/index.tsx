import {
	createEffect,
	createSignal,
	For,
	Index,
	onCleanup,
	Show,
} from "solid-js";
import { SEO } from "@/components/composite/seo";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Input } from "@/components/primitives/input";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { createUrlStringSignal } from "@/hooks/createUrlSignal";
import { type Project, useProjectSearch } from "@/hooks/projects";
import { Layout } from "@/layout/Layout";
import {
	BACK_TO_TOP_SCROLL_THRESHOLD,
	INFINITE_SCROLL_DEBOUNCE_MS,
	INFINITE_SCROLL_ROOT_MARGIN,
	SEARCH_AUTO_LOAD_LIMIT,
} from "@/lib/constants";
import { ProjectCard } from "@/routes/me/projects/sections/ProjectCard";

export const BrowseProjects = () => {
	// URL-synced state (page's concern)
	const [urlQuery, setUrlQuery] = createUrlStringSignal("q");

	// Project search hook
	const search = useProjectSearch({ showRecentWhenEmpty: true });

	// Sync URL → hook state on mount
	createEffect(() => {
		const q = urlQuery();
		if (q !== search.query()) search.setQuery(q);
	});

	// Sync hook state → URL when user interacts
	const handleSearchChange = (value: string) => {
		search.setQuery(value);
		setUrlQuery(value);
	};

	// Derived state for UI
	const hasSearchTerm = () => search.query().trim().length > 0;

	// When canLoadMore is true, trim results to make total grid cards divisible by 6
	// (works for both 2 and 3 column layouts)
	const displayProjects = () => {
		const results = search.results();
		if (!search.canLoadMore()) {
			// No more to load - show everything
			return results;
		}

		// Count fixed cards: exact match only (no add card for projects)
		const exactMatchCount = search.exactMatch() ? 1 : 0;
		const fixedCards = exactMatchCount;

		const total = fixedCards + results.length;
		const remainder = total % 6;

		if (remainder === 0) {
			return results;
		}

		// Trim results to make total divisible by 6
		const trimCount = remainder;
		if (results.length > trimCount) {
			return results.slice(0, results.length - trimCount);
		}

		return results;
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Infinite scroll
	// ─────────────────────────────────────────────────────────────────────────

	const [sentinelRef, setSentinelRef] = createSignal<HTMLDivElement | null>(
		null,
	);
	const [showBackToTop, setShowBackToTop] = createSignal(false);

	const pastAutoLoadLimit = () =>
		search.results().length >= SEARCH_AUTO_LOAD_LIMIT;

	// Debounced load more
	let loadMoreTimeout: ReturnType<typeof setTimeout> | undefined;
	const loadMoreDebounced = () => {
		if (loadMoreTimeout) return;
		loadMoreTimeout = setTimeout(() => {
			loadMoreTimeout = undefined;
			if (search.canLoadMore() && !pastAutoLoadLimit()) {
				search.loadMore();
			}
		}, INFINITE_SCROLL_DEBOUNCE_MS);
	};

	// IntersectionObserver for auto-loading
	createEffect(() => {
		const sentinel = sentinelRef();
		if (!sentinel) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					loadMoreDebounced();
				}
			},
			{ rootMargin: INFINITE_SCROLL_ROOT_MARGIN },
		);

		observer.observe(sentinel);

		onCleanup(() => {
			observer.disconnect();
			if (loadMoreTimeout) {
				clearTimeout(loadMoreTimeout);
				loadMoreTimeout = undefined;
			}
		});
	});

	// Back to top button
	createEffect(() => {
		const handleScroll = () => {
			setShowBackToTop(window.scrollY > BACK_TO_TOP_SCROLL_THRESHOLD);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		onCleanup(() => window.removeEventListener("scroll", handleScroll));
	});

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Render
	// ─────────────────────────────────────────────────────────────────────────

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
						value={search.query()}
						onInput={(e) => handleSearchChange(e.currentTarget.value)}
						placeholder="Search projects..."
						aria-label="Search projects"
					/>

					{/* Initial loading skeleton */}
					<Show when={search.isLoading()}>
						<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							<Index each={Array(6)}>{() => <SkeletonCard />}</Index>
						</div>
					</Show>

					{/* Results */}
					<Show when={!search.isLoading()}>
						<Show
							when={
								search.results().length > 0 ||
								search.exactMatch() ||
								hasSearchTerm()
							}
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
								{/* Exact match first (floated to top) */}
								<Show when={search.exactMatch()}>
									{(project) => (
										<ProjectCardWrapper project={project()} isExactMatch />
									)}
								</Show>

								{/* Search results (exact match filtered out by hook) */}
								<For each={displayProjects()}>
									{(project) => <ProjectCardWrapper project={project} />}
								</For>

								{/* Auto-load skeletons */}
								<Show when={search.canLoadMore() && !pastAutoLoadLimit()}>
									<Index each={Array(6)}>{() => <SkeletonCard />}</Index>
								</Show>
							</div>

							{/* Empty search results */}
							<Show
								when={
									hasSearchTerm() &&
									search.results().length === 0 &&
									!search.exactMatch()
								}
							>
								<Card padding="lg">
									<Stack spacing="md" align="center">
										<Text color="muted">
											No projects matching "{search.query().trim()}"
										</Text>
									</Stack>
								</Card>
							</Show>

							{/* Manual load more button (after auto-load limit) */}
							<Show when={search.canLoadMore() && pastAutoLoadLimit()}>
								<div class="flex justify-center pt-4">
									<Button variant="outline" onClick={search.loadMore}>
										Load more projects
									</Button>
								</div>
							</Show>

							{/* Sentinel for intersection observer */}
							<div ref={setSentinelRef} class="h-1" />

							{/* Back to top button */}
							<Show when={showBackToTop()}>
								<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
									<Button variant="info" size="md" onClick={scrollToTop}>
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

const ProjectCardWrapper = (props: {
	project: Project;
	isExactMatch?: boolean;
}) => {
	const card = <ProjectCard project={props.project} showAuthor />;

	if (props.isExactMatch) {
		return (
			<div class="relative">
				<div class="absolute -top-2 left-2 z-10">
					<Badge variant="info" size="sm">
						Exact match
					</Badge>
				</div>
				{card}
			</div>
		);
	}

	return card;
};

export default BrowseProjects;

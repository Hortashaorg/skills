import { queries, useQuery, useZero } from "@package/database/client";
import {
	createEffect,
	createMemo,
	createSignal,
	For,
	Index,
	onCleanup,
	Show,
} from "solid-js";
import { ActionCard } from "@/components/composite/action-card";
import {
	EntityFilter,
	type FilterOption,
} from "@/components/composite/entity-filter";
import { SEO } from "@/components/composite/seo";
import { EcosystemCard } from "@/components/feature/ecosystem-card";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { PlusIcon } from "@/components/primitives/icon";
import { Input } from "@/components/primitives/input";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import {
	TextField,
	TextFieldInput,
	TextFieldLabel,
} from "@/components/ui/text-field";
import { toast } from "@/components/ui/toast";
import {
	createUrlArraySignal,
	createUrlStringSignal,
} from "@/hooks/createUrlSignal";
import {
	createEcosystemUpvote,
	type Ecosystem,
	useEcosystemSearch,
} from "@/hooks/ecosystems";
import { useSuggestionSubmit } from "@/hooks/useSuggestionSubmit";
import { Layout } from "@/layout/Layout";
import { getAuthorizationUrl, saveReturnUrl } from "@/lib/auth-url";
import {
	BACK_TO_TOP_SCROLL_THRESHOLD,
	INFINITE_SCROLL_DEBOUNCE_MS,
	INFINITE_SCROLL_ROOT_MARGIN,
	SEARCH_AUTO_LOAD_LIMIT,
} from "@/lib/constants";

export const Ecosystems = () => {
	const zero = useZero();
	const isLoggedIn = () => zero().userID !== "anon";

	// URL-synced state (page's concern)
	const [urlQuery, setUrlQuery] = createUrlStringSignal("q");
	const [urlTags, setUrlTags] = createUrlArraySignal("tags");

	// Ecosystem search hook
	const search = useEcosystemSearch({ showRecentWhenEmpty: true });

	// Sync URL → hook state on mount
	createEffect(() => {
		const q = urlQuery();
		if (q !== search.query()) search.setQuery(q);
	});
	createEffect(() => {
		const t = urlTags();
		if (JSON.stringify(t) !== JSON.stringify(search.tags())) search.setTags(t);
	});

	// Sync hook state → URL when user interacts
	const handleSearchChange = (value: string) => {
		search.setQuery(value);
		setUrlQuery(value);
	};
	const handleTagsChange = (slugs: string[]) => {
		search.setTags(slugs);
		setUrlTags(slugs);
	};

	// Tags for filter UI (separate query)
	const [tagsWithCounts] = useQuery(queries.tags.listWithEcosystemCounts);
	const tagOptions = createMemo((): readonly FilterOption[] => {
		const tags = tagsWithCounts();
		if (!tags) return [];
		return tags.map((tag) => ({
			value: tag.slug,
			label: tag.name,
			count: tag.ecosystemTags?.length ?? 0,
		}));
	});

	// Pending suggestions (separate query)
	const [pendingSuggestions] = useQuery(() =>
		queries.suggestions.pendingCreateEcosystem(),
	);

	const pendingEcosystems = () =>
		(pendingSuggestions() ?? [])
			.map((s) => {
				const payload = s.payload as {
					name?: string;
					slug?: string;
					description?: string;
				};
				return {
					id: s.id,
					name: payload.name ?? "Unknown",
					slug: payload.slug ?? "",
					description: payload.description,
				};
			})
			.filter((p) => p.name && p.slug);

	// Derived state for UI
	const hasActiveFilters = () =>
		search.query().trim().length > 0 || search.tags().length > 0;

	// Hide pending ecosystems when filtering by tags (they don't have tags yet)
	const hasTagFilter = () => search.tags().length > 0;

	// Show suggest card when searching and no exact match
	const showSuggestCard = () =>
		search.query().trim().length > 0 && !search.exactMatch();

	// Dynamic suggest card text based on search
	const suggestCardText = () => {
		const term = search.query().trim();
		return term ? `Add "${term}"` : "Suggest Ecosystem";
	};

	// When canLoadMore is true, trim results to make total grid cards divisible by 6
	// (works for both 2 and 3 column layouts)
	const displayEcosystems = () => {
		const results = search.results();
		if (!search.canLoadMore()) {
			// No more to load - show everything
			return results;
		}

		// Count fixed cards
		const exactMatchCount = search.exactMatch() ? 1 : 0;
		const suggestCardCount = showSuggestCard() ? 1 : 0;
		const defaultSuggestCardCount = !hasActiveFilters() ? 1 : 0;
		const pendingCount = !hasTagFilter() ? pendingEcosystems().length : 0;
		const fixedCards =
			exactMatchCount +
			suggestCardCount +
			defaultSuggestCardCount +
			pendingCount;

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
	// Infinite scroll (same pattern as packages ResultsGrid)
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
	// Suggest dialog
	// ─────────────────────────────────────────────────────────────────────────

	const [dialogOpen, setDialogOpen] = createSignal(false);
	const [name, setName] = createSignal("");
	const [description, setDescription] = createSignal("");
	const [website, setWebsite] = createSignal("");

	const { submit: submitCreateEcosystem } = useSuggestionSubmit({
		type: "create_ecosystem",
		getPayload: () => ({
			name: name().trim(),
			description: description().trim() || undefined,
			website: website().trim() || undefined,
		}),
		onSuccess: () => {
			setName("");
			setDescription("");
			setWebsite("");
			setDialogOpen(false);
		},
	});

	const handleSubmit = () => {
		if (!name().trim()) {
			toast.error("Please enter an ecosystem name.", "Missing name");
			return;
		}
		submitCreateEcosystem();
	};

	const openSuggestDialog = (prefillName?: string) => {
		if (prefillName) {
			setName(prefillName);
		}
		setDialogOpen(true);
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Render
	// ─────────────────────────────────────────────────────────────────────────

	return (
		<Layout>
			<SEO
				title="Ecosystems"
				description="Explore technology ecosystems like React, AWS, Kubernetes and discover their related packages."
			/>
			<Container size="lg">
				<Stack spacing="xl" class="py-8">
					<Stack spacing="sm" align="center">
						<Heading level="h1" class="text-center">
							Ecosystems
						</Heading>
						<Text color="muted" class="text-center" as="p">
							Technology ecosystems and their related packages
						</Text>
					</Stack>

					<Flex gap="sm" align="stretch">
						<EntityFilter
							options={tagOptions()}
							selectedSlugs={search.tags()}
							onSelectionChange={handleTagsChange}
						/>
						<Input
							type="text"
							value={search.query()}
							onInput={(e) => handleSearchChange(e.currentTarget.value)}
							placeholder="Search ecosystems..."
							aria-label="Search ecosystems"
							class="flex-1"
						/>
					</Flex>

					{/* Initial loading skeleton */}
					<Show when={search.isLoading()}>
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							<Index each={Array(6)}>{() => <SkeletonCard />}</Index>
						</div>
					</Show>

					{/* Results */}
					<Show when={!search.isLoading()}>
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{/* Exact match first (floated to top) */}
							<Show when={search.exactMatch()}>
								{(ecosystem) => (
									<EcosystemCardWrapper ecosystem={ecosystem()} isExactMatch />
								)}
							</Show>

							{/* Suggest card when searching and no exact match */}
							<Show when={showSuggestCard()}>
								<ActionCard
									icon={
										<PlusIcon
											size="sm"
											class="text-primary dark:text-primary-dark"
										/>
									}
									title={suggestCardText()}
									description={
										isLoggedIn()
											? "Propose a new ecosystem"
											: "Sign in to suggest"
									}
									onClick={() => {
										if (isLoggedIn()) {
											openSuggestDialog(search.query().trim() || undefined);
										} else {
											saveReturnUrl();
											window.location.href = getAuthorizationUrl();
										}
									}}
								/>
							</Show>

							{/* Suggest card when NOT searching (always visible) */}
							<Show when={!hasActiveFilters()}>
								<ActionCard
									icon={
										<PlusIcon
											size="sm"
											class="text-primary dark:text-primary-dark"
										/>
									}
									title="Suggest Ecosystem"
									description={
										isLoggedIn()
											? "Propose a new ecosystem"
											: "Sign in to suggest"
									}
									onClick={() => {
										if (isLoggedIn()) {
											openSuggestDialog();
										} else {
											saveReturnUrl();
											window.location.href = getAuthorizationUrl();
										}
									}}
								/>
							</Show>

							{/* Pending suggestions - hide when filtering by tags */}
							<Show when={!hasTagFilter()}>
								<For each={pendingEcosystems()}>
									{(pending) => (
										<EcosystemCard
											name={pending.name}
											description={pending.description}
											href={`/ecosystem/${pending.slug}`}
											upvoteCount={0}
											isUpvoted={false}
											upvoteDisabled={true}
											onUpvote={() => {}}
											isPending
										/>
									)}
								</For>
							</Show>

							{/* Search results (exact match filtered out by hook) */}
							<For each={displayEcosystems()}>
								{(ecosystem) => <EcosystemCardWrapper ecosystem={ecosystem} />}
							</For>

							{/* Auto-load skeletons */}
							<Show when={search.canLoadMore() && !pastAutoLoadLimit()}>
								<Index each={Array(6)}>{() => <SkeletonCard />}</Index>
							</Show>
						</div>

						{/* Manual load more button (after auto-load limit) */}
						<Show when={search.canLoadMore() && pastAutoLoadLimit()}>
							<div class="flex justify-center pt-4">
								<Button variant="outline" onClick={search.loadMore}>
									Load more ecosystems
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
				</Stack>
			</Container>

			<Dialog
				title="Suggest New Ecosystem"
				description="Propose a technology ecosystem for the community to curate."
				open={dialogOpen()}
				onOpenChange={setDialogOpen}
			>
				<Stack spacing="md">
					<TextField>
						<TextFieldLabel>Name *</TextFieldLabel>
						<TextFieldInput
							placeholder="e.g. React, Kubernetes, TailwindCSS"
							value={name()}
							onInput={(e) => setName(e.currentTarget.value)}
						/>
					</TextField>
					<TextField>
						<TextFieldLabel>Description</TextFieldLabel>
						<TextFieldInput
							placeholder="A short description of this ecosystem"
							value={description()}
							onInput={(e) => setDescription(e.currentTarget.value)}
						/>
					</TextField>
					<TextField>
						<TextFieldLabel>Website</TextFieldLabel>
						<TextFieldInput
							type="url"
							placeholder="https://example.com"
							value={website()}
							onInput={(e) => setWebsite(e.currentTarget.value)}
						/>
					</TextField>
					<Flex gap="sm" justify="end">
						<Button
							size="sm"
							variant="outline"
							onClick={() => setDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							size="sm"
							variant="primary"
							onClick={handleSubmit}
							disabled={!name().trim()}
						>
							Submit
						</Button>
					</Flex>
					<Text size="xs" color="muted">
						Suggestions need community votes to be approved.
					</Text>
				</Stack>
			</Dialog>
		</Layout>
	);
};

const EcosystemCardWrapper = (props: {
	ecosystem: Ecosystem;
	isExactMatch?: boolean;
}) => {
	const upvote = createEcosystemUpvote(() => props.ecosystem);

	const tags = () =>
		props.ecosystem.ecosystemTags
			?.filter(
				(et): et is typeof et & { tag: NonNullable<typeof et.tag> } => !!et.tag,
			)
			.map((et) => ({
				name: et.tag.name,
				slug: et.tag.slug,
			})) ?? [];

	const card = (
		<EcosystemCard
			name={props.ecosystem.name}
			description={props.ecosystem.description}
			href={`/ecosystem/${props.ecosystem.slug}`}
			upvoteCount={upvote.upvoteCount()}
			isUpvoted={upvote.isUpvoted()}
			upvoteDisabled={upvote.isDisabled()}
			onUpvote={upvote.toggle}
			tags={tags()}
			packageCount={props.ecosystem.ecosystemPackages?.length ?? 0}
		/>
	);

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

export default Ecosystems;

import type { Row } from "@package/database/client";
import { mutators, queries, useQuery, useZero } from "@package/database/client";
import {
	createEffect,
	createMemo,
	createSignal,
	For,
	Index,
	on,
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
	TextField,
	TextFieldInput,
	TextFieldLabel,
} from "@/components/ui/text-field";
import { toast } from "@/components/ui/toast";
import { createEcosystemUpvote } from "@/hooks/createEcosystemUpvote";
import {
	createUrlArraySignal,
	createUrlStringSignal,
} from "@/hooks/createUrlSignal";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Layout } from "@/layout/Layout";
import { getAuthorizationUrl, saveReturnUrl } from "@/lib/auth-url";
import {
	ECOSYSTEMS_AUTO_LOAD_LIMIT,
	ECOSYSTEMS_INITIAL_LIMIT,
	ECOSYSTEMS_LOAD_MORE_COUNT,
} from "@/lib/constants";

type EcosystemTag = Row["ecosystemTags"] & {
	tag?: Row["tags"];
};

type Ecosystem = Row["ecosystems"] & {
	upvotes?: readonly Row["ecosystemUpvotes"][];
	ecosystemPackages?: readonly Row["ecosystemPackages"][];
	ecosystemTags?: readonly EcosystemTag[];
};

const SkeletonCard = () => (
	<Card padding="md" class="h-full">
		<div class="flex flex-col h-full gap-2">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Skeleton width="120px" height="20px" />
					<Skeleton width="40px" height="20px" />
				</div>
				<Skeleton width="50px" height="28px" variant="rectangular" />
			</div>
			<Skeleton width="100%" height="16px" />
			<Skeleton width="75%" height="16px" />
		</div>
	</Card>
);

export const Ecosystems = () => {
	const zero = useZero();
	const isLoggedIn = () => zero().userID !== "anon";

	const [searchValue, setSearchValue] = createUrlStringSignal("q");
	const [selectedTagSlugs, setSelectedTagSlugs] = createUrlArraySignal("tags");
	const searchTerm = () => searchValue().trim();

	// Infinite scroll state
	const scroll = useInfiniteScroll({
		initialLimit: ECOSYSTEMS_INITIAL_LIMIT,
		loadMoreCount: ECOSYSTEMS_LOAD_MORE_COUNT,
		autoLoadLimit: ECOSYSTEMS_AUTO_LOAD_LIMIT,
	});

	// Track if we've ever completed loading - prevents flicker on re-sync
	const [hasLoadedOnce, setHasLoadedOnce] = createSignal(false);

	// Reset limit and loading state when filters change
	createEffect(
		on([searchValue, selectedTagSlugs], () => {
			scroll.resetLimit();
			setHasLoadedOnce(false);
		}),
	);

	const [ecosystems, ecosystemsResult] = useQuery(() =>
		queries.ecosystems.search({
			query: searchTerm() || undefined,
			tagSlugs: selectedTagSlugs().length > 0 ? selectedTagSlugs() : undefined,
			limit: scroll.limit(),
		}),
	);
	const [pendingSuggestions] = useQuery(() =>
		queries.suggestions.pendingCreateEcosystem(),
	);

	// Tags for filter
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

	const isLoading = () => ecosystemsResult().type !== "complete";
	const ecosystemCount = () => ecosystems()?.length ?? 0;
	const canLoadMore = () => scroll.canLoadMore(ecosystemCount());

	// Set loaded once when query completes
	createEffect(() => {
		if (!isLoading()) {
			setHasLoadedOnce(true);
		}
	});

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

	// Hide pending ecosystems when filtering by tags (they don't have tags yet)
	const hasTagFilter = () => selectedTagSlugs().length > 0;

	// Dynamic suggest card text based on search
	const suggestCardText = () =>
		searchTerm() ? `Add "${searchTerm()}"` : "Suggest Ecosystem";

	const [dialogOpen, setDialogOpen] = createSignal(false);
	const [name, setName] = createSignal("");
	const [description, setDescription] = createSignal("");
	const [website, setWebsite] = createSignal("");
	const [isSubmitting, setIsSubmitting] = createSignal(false);

	const handleSubmit = () => {
		const ecosystemName = name().trim();
		if (!ecosystemName) {
			toast.error("Please enter an ecosystem name.", "Missing name");
			return;
		}

		setIsSubmitting(true);
		try {
			zero().mutate(
				mutators.suggestions.create({
					type: "create_ecosystem",
					payload: {
						name: ecosystemName,
						description: description().trim() || undefined,
						website: website().trim() || undefined,
					},
				}),
			);
			setName("");
			setDescription("");
			setWebsite("");
			setDialogOpen(false);
			toast.success(
				"Your ecosystem suggestion is now pending review.",
				"Suggestion submitted",
			);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Unknown error",
				"Failed to submit",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const openSuggestDialog = (prefillName?: string) => {
		if (prefillName) {
			setName(prefillName);
		}
		setDialogOpen(true);
	};

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
							selectedSlugs={selectedTagSlugs()}
							onSelectionChange={setSelectedTagSlugs}
						/>
						<Input
							type="text"
							value={searchValue()}
							onInput={(e) => setSearchValue(e.currentTarget.value)}
							placeholder="Search ecosystems..."
							aria-label="Search ecosystems"
							class="flex-1"
						/>
					</Flex>

					{/* Initial loading skeleton - only show if never loaded */}
					<Show when={isLoading() && !hasLoadedOnce()}>
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							<Index each={Array(6)}>{() => <SkeletonCard />}</Index>
						</div>
					</Show>

					{/* Results - show once we've loaded at least once */}
					<Show when={hasLoadedOnce()}>
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{/* Suggest ecosystem card - always visible */}
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
										openSuggestDialog(searchTerm() || undefined);
									} else {
										saveReturnUrl();
										window.location.href = getAuthorizationUrl();
									}
								}}
							/>

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

							{/* Existing ecosystems */}
							<For each={ecosystems()}>
								{(ecosystem) => <EcosystemCardWrapper ecosystem={ecosystem} />}
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
									Load more ecosystems
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
							disabled={!name().trim() || isSubmitting()}
						>
							{isSubmitting() ? "Submitting..." : "Submit"}
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

const EcosystemCardWrapper = (props: { ecosystem: Ecosystem }) => {
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

	return (
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
};

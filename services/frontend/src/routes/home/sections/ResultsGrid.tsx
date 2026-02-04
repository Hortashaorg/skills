import type { Row } from "@package/database/client";
import { useZero } from "@package/database/client";
import {
	createEffect,
	createSignal,
	For,
	Index,
	Match,
	onCleanup,
	Show,
	Switch,
} from "solid-js";
import { ActionCard } from "@/components/composite/action-card";
import { PackageCard } from "@/components/feature/package-card";
import { Flex } from "@/components/primitives/flex";
import { PlusIcon } from "@/components/primitives/icon";
import { Stack } from "@/components/primitives/stack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { Spinner } from "@/components/ui/spinner";
import { createPackageRequest, createPackageUpvote } from "@/hooks/packages";
import { getAuthorizationUrl, saveReturnUrl } from "@/lib/auth-url";
import {
	BACK_TO_TOP_SCROLL_THRESHOLD,
	INFINITE_SCROLL_DEBOUNCE_MS,
	INFINITE_SCROLL_ROOT_MARGIN,
	SEARCH_AUTO_LOAD_LIMIT,
} from "@/lib/constants";
import { REGISTRY_OPTIONS, type Registry } from "@/lib/registries";
import { buildPackageUrl } from "@/lib/url";

type PackageTag = Row["packageTags"] & {
	tag?: Row["tags"];
};

export type Package = Row["packages"] & {
	upvotes?: readonly Row["packageUpvotes"][];
	packageTags?: readonly PackageTag[];
};

export interface ResultsGridProps {
	packages: readonly Package[];
	isLoading?: boolean;
	hasActiveFilters?: boolean;
	canLoadMore?: boolean;
	onLoadMore?: () => void;
	exactMatches?: readonly Package[];
	showAddCard?: boolean;
	searchTerm?: string;
	registry?: Registry;
}

const SKELETON_COUNT = 6;

const SearchIcon = () => (
	<svg
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		class="w-full h-full"
		aria-hidden="true"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="1.5"
			d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
		/>
	</svg>
);

export const ResultsGrid = (props: ResultsGridProps) => {
	const zero = useZero();
	const [requestRegistry, setRequestRegistry] = createSignal<Registry>("npm");
	const [sentinelRef, setSentinelRef] = createSignal<HTMLDivElement | null>(
		null,
	);
	const [showBackToTop, setShowBackToTop] = createSignal(false);
	const [registryDialogOpen, setRegistryDialogOpen] = createSignal(false);

	const effectiveRegistry = (): Registry => props.registry ?? requestRegistry();

	const packageRequest = createPackageRequest(() => ({
		name: props.searchTerm ?? "",
		registry: effectiveRegistry(),
	}));

	const isLoggedIn = () => zero().userID !== "anon";

	const hasExactMatches = () => (props.exactMatches?.length ?? 0) > 0;

	const showEmptyState = () =>
		!props.isLoading &&
		props.packages.length === 0 &&
		!hasExactMatches() &&
		!props.showAddCard;

	const showResults = () =>
		props.packages.length > 0 || hasExactMatches() || props.showAddCard;

	// When canLoadMore is true, trim packages to make total grid cards divisible by 6
	// (works for both 2 and 3 column layouts)
	const displayPackages = () => {
		const packages = props.packages;
		if (!props.canLoadMore) {
			// No more to load - show everything
			return packages;
		}

		// Count fixed cards: exact matches + add card (if shown)
		const exactMatchCount = props.exactMatches?.length ?? 0;
		const addCardCount = props.showAddCard ? 1 : 0;
		const fixedCards = exactMatchCount + addCardCount;

		const total = fixedCards + packages.length;
		const remainder = total % 6;

		if (remainder === 0) {
			return packages;
		}

		// Trim packages to make total divisible by 6
		const trimCount = remainder;
		if (packages.length > trimCount) {
			return packages.slice(0, packages.length - trimCount);
		}

		return packages;
	};

	// Stop auto-loading after limit, require manual "Load more"
	const pastAutoLoadLimit = () =>
		props.packages.length >= SEARCH_AUTO_LOAD_LIMIT;

	// Debounced load more to prevent rapid-fire calls
	let loadMoreTimeout: ReturnType<typeof setTimeout> | undefined;
	const loadMoreDebounced = () => {
		if (loadMoreTimeout) return;
		loadMoreTimeout = setTimeout(() => {
			loadMoreTimeout = undefined;
			if (props.canLoadMore && props.onLoadMore && !pastAutoLoadLimit()) {
				props.onLoadMore();
			}
		}, INFINITE_SCROLL_DEBOUNCE_MS);
	};

	// Infinite scroll with IntersectionObserver (only before limit)
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

	// Show back to top after scrolling down
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

	return (
		<>
			<Switch>
				<Match when={showEmptyState()}>
					<EmptyState
						icon={<SearchIcon />}
						title="No packages found"
						description="Try a different search term or adjust your filters."
					/>
				</Match>

				<Match when={props.isLoading && !showResults()}>
					{/* Initial loading - show skeleton grid */}
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						<Index each={Array(SKELETON_COUNT)}>{() => <SkeletonCard />}</Index>
					</div>
				</Match>

				<Match when={showResults()}>
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{/* Exact matches first (can be multiple across registries) */}
						<For each={props.exactMatches}>
							{(pkg) => <ExactMatchCard pkg={pkg} />}
						</For>

						{/* Add card if no exact matches found */}
						<Show when={props.showAddCard ? props.searchTerm : undefined}>
							{(term) => (
								<ActionCard
									icon={
										<PlusIcon
											size="sm"
											class="text-primary dark:text-primary-dark"
										/>
									}
									title={`Add "${term()}"`}
									description={
										isLoggedIn()
											? props.registry
												? `Request from ${props.registry}`
												: "Choose a registry"
											: "Sign in to request"
									}
									onClick={() => {
										if (!isLoggedIn()) {
											saveReturnUrl();
											window.location.href = getAuthorizationUrl();
										} else if (props.registry) {
											packageRequest.submit();
										} else {
											setRegistryDialogOpen(true);
										}
									}}
									disabled={packageRequest.isSubmitting()}
								/>
							)}
						</Show>

						{/* Rest of the packages */}
						<For each={displayPackages()}>
							{(pkg) => <PackageCardWrapper pkg={pkg} />}
						</For>

						{/* Skeleton cards for auto-loading (before limit) */}
						<Show when={props.canLoadMore && !pastAutoLoadLimit()}>
							<Index each={Array(6)}>{() => <SkeletonCard />}</Index>
						</Show>
					</div>

					{/* Load more button after auto-load limit */}
					<Show when={props.canLoadMore && pastAutoLoadLimit()}>
						<div class="flex justify-center pt-4">
							<Button variant="outline" onClick={props.onLoadMore}>
								Load more packages
							</Button>
						</div>
					</Show>

					{/* Infinite scroll sentinel */}
					<div ref={setSentinelRef} class="h-1" />

					{/* Back to top button */}
					<Show when={showBackToTop()}>
						<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
							<Button variant="info" size="md" onClick={scrollToTop}>
								↑ Back to top
							</Button>
						</div>
					</Show>
				</Match>
			</Switch>

			{/* Registry selection dialog */}
			<Dialog
				title="Request Package"
				description={`Choose a registry to request "${props.searchTerm}" from.`}
				open={registryDialogOpen()}
				onOpenChange={setRegistryDialogOpen}
			>
				<Stack spacing="md">
					<Select
						options={REGISTRY_OPTIONS}
						value={requestRegistry()}
						onChange={setRequestRegistry}
						aria-label="Select registry"
						disabled={packageRequest.isSubmitting()}
					/>
					<Flex gap="sm" justify="end">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setRegistryDialogOpen(false)}
							disabled={packageRequest.isSubmitting()}
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							size="sm"
							onClick={() => {
								packageRequest.submit();
								setRegistryDialogOpen(false);
							}}
							disabled={packageRequest.isSubmitting()}
						>
							<Show when={packageRequest.isSubmitting()} fallback="Request">
								<Spinner size="sm" srText="Requesting" />
								<span class="ml-2">Requesting...</span>
							</Show>
						</Button>
					</Flex>
				</Stack>
			</Dialog>
		</>
	);
};

const PackageCardWrapper = (props: { pkg: Package }) => {
	const upvote = createPackageUpvote(() => props.pkg);
	const tags = () =>
		props.pkg.packageTags
			?.filter(
				(pt): pt is typeof pt & { tag: NonNullable<typeof pt.tag> } => !!pt.tag,
			)
			.map((pt) => ({
				name: pt.tag.name,
				slug: pt.tag.slug,
			})) ?? [];

	return (
		<PackageCard
			name={props.pkg.name}
			registry={props.pkg.registry}
			description={props.pkg.description}
			href={buildPackageUrl(props.pkg.registry, props.pkg.name)}
			upvoteCount={upvote.upvoteCount()}
			isUpvoted={upvote.isUpvoted()}
			upvoteDisabled={upvote.isDisabled()}
			onUpvote={upvote.toggle}
			tags={tags()}
		/>
	);
};

const ExactMatchCard = (props: { pkg: Package }) => {
	const upvote = createPackageUpvote(() => props.pkg);
	const tags = () =>
		props.pkg.packageTags
			?.filter(
				(pt): pt is typeof pt & { tag: NonNullable<typeof pt.tag> } => !!pt.tag,
			)
			.map((pt) => ({
				name: pt.tag.name,
				slug: pt.tag.slug,
			})) ?? [];

	const isPending = () => props.pkg.status === "placeholder";
	const isFailed = () => props.pkg.status === "failed";
	const status = () =>
		isPending() ? "placeholder" : isFailed() ? "failed" : undefined;

	return (
		<div class="relative">
			<div class="absolute -top-2 left-2 z-10">
				<Badge variant="info" size="sm">
					Exact match
				</Badge>
			</div>
			<PackageCard
				name={props.pkg.name}
				registry={props.pkg.registry}
				description={props.pkg.description}
				href={buildPackageUrl(props.pkg.registry, props.pkg.name)}
				upvoteCount={upvote.upvoteCount()}
				isUpvoted={upvote.isUpvoted()}
				upvoteDisabled={upvote.isDisabled()}
				onUpvote={upvote.toggle}
				tags={tags()}
				status={status()}
				failureReason={props.pkg.failureReason}
			/>
		</div>
	);
};

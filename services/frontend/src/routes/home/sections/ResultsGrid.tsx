import type { Row } from "@package/database/client";
import { useZero } from "@package/database/client";
import { createSignal, For, Match, Show, Switch } from "solid-js";
import { PackageCard } from "@/components/feature/package-card";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { createPackageRequest } from "@/hooks/createPackageRequest";
import { createPackageUpvote } from "@/hooks/createPackageUpvote";
import { getAuthorizationUrl, saveReturnUrl } from "@/lib/auth-url";
import { REGISTRY_OPTIONS, type Registry } from "@/lib/registries";
import { buildPackageUrl } from "@/lib/url";

type PackageTag = Row["packageTags"] & {
	tag?: Row["tags"];
};

type Package = Row["packages"] & {
	upvotes?: readonly Row["packageUpvotes"][];
	packageTags?: readonly PackageTag[];
};

export interface ResultsGridProps {
	packages: readonly Package[];
	totalCount: number;
	page: number;
	pageSize: number;
	onPageChange: (page: number) => void;
	isLoading?: boolean;
	hasActiveFilters?: boolean;
	hasExactTotal?: boolean;
	canLoadMore?: boolean;
	onLoadMore?: () => void;
	exactMatch?: Package;
	showAddCard?: boolean;
	searchTerm?: string;
	registry?: Registry;
}

const LoadingSpinner = () => (
	<div class="flex justify-center py-12">
		<Spinner label="Loading packages..." />
	</div>
);

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

	const effectiveRegistry = (): Registry => props.registry ?? requestRegistry();

	const packageRequest = createPackageRequest(() => ({
		name: props.searchTerm ?? "",
		registry: effectiveRegistry(),
	}));

	const isLoggedIn = () => zero().userID !== "anon";

	const totalPages = () => Math.ceil(props.totalCount / props.pageSize);
	const startIndex = () => props.page * props.pageSize + 1;
	const endIndex = () =>
		Math.min((props.page + 1) * props.pageSize, props.totalCount);

	const headerText = () => {
		if (props.hasActiveFilters) {
			if (props.hasExactTotal === false) {
				return `Showing ${startIndex()}-${endIndex()}`;
			}
			return `Showing ${startIndex()}-${endIndex()} of ${props.totalCount} result${props.totalCount !== 1 ? "s" : ""}`;
		}
		return "Recently updated";
	};

	// Show empty state only when no results AND no exact match AND no add card
	const showEmptyState = () =>
		props.totalCount === 0 && !props.exactMatch && !props.showAddCard;

	// Show results grid when we have packages OR exact match OR add card
	const showResults = () =>
		props.totalCount > 0 || props.exactMatch || props.showAddCard;

	return (
		<Switch>
			<Match when={props.isLoading}>
				<LoadingSpinner />
			</Match>

			<Match when={showEmptyState()}>
				<EmptyState
					icon={<SearchIcon />}
					title="No packages found"
					description="Try a different search term or adjust your filters."
				/>
			</Match>

			<Match when={showResults()}>
				<Stack spacing="sm">
					<Text size="sm" color="muted">
						{headerText()}
					</Text>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{/* First card: exact match or add card */}
						<Show when={props.exactMatch}>
							{(pkg) => <ExactMatchCard pkg={pkg()} />}
						</Show>
						<Show when={props.showAddCard ? props.searchTerm : undefined}>
							{(term) => (
								<AddPackageCard
									searchTerm={term()}
									isLoggedIn={isLoggedIn()}
									registry={props.registry}
									requestRegistry={requestRegistry()}
									onRegistryChange={setRequestRegistry}
									packageRequest={packageRequest}
									effectiveRegistry={effectiveRegistry()}
								/>
							)}
						</Show>

						{/* Rest of the packages */}
						<For each={props.packages}>
							{(pkg) => <PackageCardWrapper pkg={pkg} />}
						</For>
					</div>

					<Show when={totalPages() > 1}>
						<Flex justify="between" align="center" class="mt-2">
							<Text size="sm" color="muted">
								Page {props.page + 1}
								{props.hasExactTotal !== false && ` of ${totalPages()}`}
							</Text>
							<Flex gap="sm" align="center">
								<Button
									variant="outline"
									size="sm"
									disabled={props.page === 0}
									onClick={() => props.onPageChange(props.page - 1)}
								>
									Previous
								</Button>
								<Show
									when={
										props.page >= totalPages() - 1 &&
										props.canLoadMore &&
										props.onLoadMore
									}
									fallback={
										<Button
											variant="outline"
											size="sm"
											disabled={props.page >= totalPages() - 1}
											onClick={() => props.onPageChange(props.page + 1)}
										>
											Next
										</Button>
									}
								>
									<Button
										variant="outline"
										size="sm"
										onClick={props.onLoadMore}
									>
										Load more
									</Button>
								</Show>
							</Flex>
						</Flex>
					</Show>
				</Stack>
			</Match>
		</Switch>
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
			<div class="absolute -top-2 left-2 z-10 flex gap-1">
				<Badge variant="info" size="sm">
					Exact match
				</Badge>
				<Show when={isPending()}>
					<Badge variant="warning" size="sm">
						Pending
					</Badge>
				</Show>
				<Show when={isFailed()}>
					<Badge variant="danger" size="sm">
						Failed
					</Badge>
				</Show>
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

interface AddPackageCardProps {
	searchTerm: string;
	isLoggedIn: boolean;
	registry: Registry | undefined;
	requestRegistry: Registry;
	onRegistryChange: (registry: Registry) => void;
	packageRequest: ReturnType<typeof createPackageRequest>;
	effectiveRegistry: Registry;
}

const AddPackageCard = (props: AddPackageCardProps) => {
	return (
		<Card padding="md" class="flex flex-col justify-center min-h-30">
			<Stack spacing="sm">
				<Text weight="medium">Add "{props.searchTerm}"</Text>
				<Show
					when={props.isLoggedIn}
					fallback={
						<Button
							variant="primary"
							size="sm"
							onClick={() => {
								saveReturnUrl();
								window.location.href = getAuthorizationUrl();
							}}
						>
							Sign in to request
						</Button>
					}
				>
					<Show
						when={!props.packageRequest.isRequested()}
						fallback={<Badge variant="success">Request submitted</Badge>}
					>
						<Flex gap="sm" align="center" wrap="wrap">
							<Show when={!props.registry}>
								<Select
									options={REGISTRY_OPTIONS}
									value={props.requestRegistry}
									onChange={props.onRegistryChange}
									aria-label="Select registry"
									disabled={props.packageRequest.isSubmitting()}
									class="w-auto"
								/>
							</Show>
							<Button
								variant="primary"
								size="sm"
								onClick={() => props.packageRequest.submit()}
								disabled={props.packageRequest.isSubmitting()}
							>
								<Show
									when={props.packageRequest.isSubmitting()}
									fallback={`Request from ${props.effectiveRegistry}`}
								>
									<Spinner size="sm" srText="Requesting" />
									<span class="ml-2">Requesting...</span>
								</Show>
							</Button>
						</Flex>
					</Show>
				</Show>
			</Stack>
		</Card>
	);
};

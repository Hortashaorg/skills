import {
	getSuggestionTypeLabel,
	mutators,
	queries,
	useQuery,
	useZero,
} from "@package/database/client";
import { A, useParams } from "@solidjs/router";
import { createMemo, createSignal, Show } from "solid-js";
import { SEO } from "@/components/composite/seo";
import {
	type SuggestionItem,
	SuggestionModal,
} from "@/components/feature/suggestion-modal";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { Layout } from "@/layout/Layout";
import { getDisplayName } from "@/lib/account";
import { getAuthorizationUrl, saveReturnUrl } from "@/lib/auth-url";
import { EcosystemHeader } from "./sections/EcosystemHeader";
import {
	EcosystemPackages,
	groupPackagesByTag,
} from "./sections/EcosystemPackages";

const EcosystemSkeleton = () => (
	<Stack spacing="lg">
		<Stack spacing="md">
			<Flex justify="between" align="start">
				<Stack spacing="xs" class="flex-1">
					<Skeleton variant="text" width="200px" height="32px" />
					<Skeleton variant="text" width="300px" height="20px" />
				</Stack>
				<Skeleton variant="rectangular" width="100px" height="36px" />
			</Flex>
		</Stack>
		<Skeleton variant="rectangular" height="200px" />
	</Stack>
);

export const Ecosystem = () => {
	const params = useParams<{ slug: string }>();
	const slug = () => decodeURIComponent(params.slug);

	const zero = useZero();
	const isLoggedIn = () => zero().userID !== "anon";
	const currentUserId = () => (isLoggedIn() ? zero().userID : null);

	const [ecosystemData, ecosystemResult] = useQuery(() =>
		queries.ecosystems.bySlug({ slug: slug() }),
	);

	const isLoading = () => ecosystemResult().type !== "complete";
	const ecosystem = createMemo(() => ecosystemData()?.[0] ?? null);

	// Upvote logic
	const userUpvote = createMemo(() => {
		const eco = ecosystem();
		if (!eco?.upvotes) return null;
		return eco.upvotes.find((u) => u.accountId === zero().userID) ?? null;
	});

	const hasUpvoted = () => !!userUpvote();

	const handleUpvote = () => {
		const eco = ecosystem();
		if (!eco || !isLoggedIn()) return;

		const upvote = userUpvote();
		if (upvote) {
			zero().mutate(
				mutators.ecosystemUpvotes.remove({
					id: upvote.id,
					ecosystemId: eco.id,
				}),
			);
		} else {
			zero().mutate(
				mutators.ecosystemUpvotes.create({
					ecosystemId: eco.id,
				}),
			);
		}
	};

	// Tags
	const tags = createMemo(() => {
		const eco = ecosystem();
		if (!eco?.ecosystemTags) return [];
		return eco.ecosystemTags
			.filter(
				(et): et is typeof et & { tag: NonNullable<typeof et.tag> } => !!et.tag,
			)
			.map((et) => ({ name: et.tag.name, slug: et.tag.slug }));
	});

	// Packages grouped by tag
	const packages = createMemo(() => {
		const eco = ecosystem();
		if (!eco?.ecosystemPackages) return [];
		return eco.ecosystemPackages
			.map((ep) => ep.package)
			.filter((pkg) => pkg != null);
	});

	const packagesByTag = createMemo(() => groupPackagesByTag(packages()));

	// Pending suggestions
	const [pendingSuggestions] = useQuery(() => {
		const eco = ecosystem();
		if (!eco) return null;
		return queries.suggestions.pendingForEcosystem({ ecosystemId: eco.id });
	});

	// All tags for picker
	const [allTags] = useQuery(() => queries.tags.list());

	const tagsById = createMemo(() => {
		const all = allTags() ?? [];
		return new Map(all.map((t) => [t.id, t]));
	});

	// Available tags (not already on ecosystem, not pending)
	const existingTagIds = createMemo(() => {
		const eco = ecosystem();
		if (!eco?.ecosystemTags) return new Set<string>();
		return new Set(eco.ecosystemTags.map((et) => et.tagId));
	});

	const pendingTagIds = createMemo(() => {
		const suggestions = pendingSuggestions() ?? [];
		return new Set(
			suggestions
				.filter((s) => s.type === "add_ecosystem_tag")
				.map((s) => (s.payload as { tagId?: string })?.tagId)
				.filter(Boolean) as string[],
		);
	});

	const availableTags = createMemo(() => {
		const all = allTags() ?? [];
		const existing = existingTagIds();
		const pending = pendingTagIds();
		return all
			.filter((t) => !existing.has(t.id) && !pending.has(t.id))
			.sort((a, b) => a.name.localeCompare(b.name));
	});

	const tagOptions = createMemo(() =>
		availableTags().map((t) => ({ value: t.id, label: t.name })),
	);

	// Tag suggestion modal
	const [tagModalOpen, setTagModalOpen] = createSignal(false);
	const [selectedTagId, setSelectedTagId] = createSignal<string>();

	const tagSuggestions = createMemo((): SuggestionItem[] => {
		const suggestions = pendingSuggestions() ?? [];
		return suggestions
			.filter((s) => s.type === "add_ecosystem_tag")
			.map((s) => {
				const tagId = (s.payload as { tagId?: string })?.tagId;
				const tagName = tagId ? tagsById().get(tagId)?.name : undefined;
				return {
					id: s.id,
					type: s.type,
					typeLabel: getSuggestionTypeLabel(s.type),
					description: tagName ?? "Unknown tag",
					justification: s.justification,
					authorName: getDisplayName(s.account),
					authorId: s.accountId,
					votes: s.votes ?? [],
				};
			});
	});

	const handleSuggestTag = (justification?: string) => {
		const eco = ecosystem();
		const tagId = selectedTagId();
		if (!eco || !tagId) return;

		try {
			zero().mutate(
				mutators.suggestions.createAddEcosystemTag({
					ecosystemId: eco.id,
					tagId,
					justification,
				}),
			);
			setSelectedTagId(undefined);
			setTagModalOpen(false);
			toast.success(
				"Your tag suggestion is now pending review.",
				"Suggestion submitted",
			);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Unknown error",
				"Failed to submit",
			);
		}
	};

	// Package suggestion modal
	const [packageModalOpen, setPackageModalOpen] = createSignal(false);
	const [packageSearchQuery, setPackageSearchQuery] = createSignal("");

	const [searchResults] = useQuery(() =>
		queries.packages.search({
			query: packageSearchQuery() || undefined,
			limit: 10,
		}),
	);

	const existingPackageIds = createMemo(() => {
		const eco = ecosystem();
		if (!eco?.ecosystemPackages) return new Set<string>();
		return new Set(
			eco.ecosystemPackages
				.map((ep) => ep.package?.id)
				.filter(Boolean) as string[],
		);
	});

	const pendingPackageIds = createMemo(() => {
		const suggestions = pendingSuggestions() ?? [];
		return new Set(
			suggestions
				.filter((s) => s.type === "add_ecosystem_package")
				.map((s) => (s.payload as { packageId?: string })?.packageId)
				.filter(Boolean) as string[],
		);
	});

	const availablePackages = createMemo(() => {
		const results = searchResults() ?? [];
		const existing = existingPackageIds();
		const pending = pendingPackageIds();
		return results.filter(
			(pkg) => !existing.has(pkg.id) && !pending.has(pkg.id),
		);
	});

	const packageOptions = createMemo(() =>
		availablePackages().map((p) => ({
			value: p.id,
			label: `${p.name} (${p.registry})`,
		})),
	);

	const [selectedPackageId, setSelectedPackageId] = createSignal<string>();

	const packageSuggestions = createMemo((): SuggestionItem[] => {
		const suggestions = pendingSuggestions() ?? [];
		return suggestions
			.filter((s) => s.type === "add_ecosystem_package")
			.map((s) => ({
				id: s.id,
				type: s.type,
				typeLabel: getSuggestionTypeLabel(s.type),
				description: s.package?.name ?? "Unknown package",
				justification: s.justification,
				authorName: getDisplayName(s.account),
				authorId: s.accountId,
				votes: s.votes ?? [],
			}));
	});

	const handleSuggestPackage = (justification?: string) => {
		const eco = ecosystem();
		const packageId = selectedPackageId();
		if (!eco || !packageId) return;

		try {
			zero().mutate(
				mutators.suggestions.createAddEcosystemPackage({
					ecosystemId: eco.id,
					packageId,
					justification,
				}),
			);
			setSelectedPackageId(undefined);
			setPackageSearchQuery("");
			setPackageModalOpen(false);
			toast.success(
				"Your package suggestion is now pending review.",
				"Suggestion submitted",
			);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Unknown error",
				"Failed to submit",
			);
		}
	};

	// Vote handler
	const handleVote = (suggestionId: string, vote: "approve" | "reject") => {
		try {
			zero().mutate(mutators.suggestionVotes.vote({ suggestionId, vote }));
			toast.success(
				"Your vote has been recorded.",
				vote === "approve" ? "Approved" : "Rejected",
			);
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Unknown error",
				"Failed to vote",
			);
		}
	};

	const handleLogin = () => {
		saveReturnUrl();
		window.location.href = getAuthorizationUrl();
	};

	const handleAddTag = () => {
		if (!isLoggedIn()) {
			toast.info("Sign in to suggest tags.", "Sign in required");
			return;
		}
		setTagModalOpen(true);
	};

	const handleAddPackage = () => {
		if (!isLoggedIn()) {
			toast.info("Sign in to suggest packages.", "Sign in required");
			return;
		}
		setPackageModalOpen(true);
	};

	return (
		<Layout>
			<SEO
				title={ecosystem()?.name ?? "Ecosystem"}
				description={
					ecosystem()?.description ??
					"Explore this technology ecosystem and its related packages."
				}
			/>
			<Container size="lg">
				<Stack spacing="lg" class="py-8">
					<Show when={!isLoading()} fallback={<EcosystemSkeleton />}>
						<Show
							when={ecosystem()}
							fallback={
								<Card padding="lg">
									<Stack spacing="md" align="center">
										<Heading level="h2">Ecosystem not found</Heading>
										<Text color="muted">
											This ecosystem doesn't exist or has been deleted.
										</Text>
										<A href="/ecosystems">
											<Button variant="outline">Browse Ecosystems</Button>
										</A>
									</Stack>
								</Card>
							}
						>
							{(eco) => (
								<>
									<EcosystemHeader
										name={eco().name}
										description={eco().description}
										website={eco().website}
										tags={tags()}
										upvoteCount={eco().upvoteCount}
										hasUpvoted={hasUpvoted()}
										isLoggedIn={isLoggedIn()}
										onUpvote={handleUpvote}
										onAddTag={handleAddTag}
									/>

									<Stack spacing="md">
										<Flex justify="between" align="center">
											<Heading level="h2">
												Packages ({packages().length})
											</Heading>
										</Flex>

										<EcosystemPackages
											packages={packages()}
											packagesByTag={packagesByTag()}
											onSuggestPackage={handleAddPackage}
										/>
									</Stack>
								</>
							)}
						</Show>
					</Show>
				</Stack>
			</Container>

			<SuggestionModal
				open={tagModalOpen()}
				onOpenChange={setTagModalOpen}
				title="Suggest Tags"
				description="Help categorize this ecosystem by suggesting relevant tags."
				isLoggedIn={isLoggedIn()}
				onLoginClick={handleLogin}
				currentUserId={currentUserId()}
				pendingSuggestions={tagSuggestions()}
				onVote={handleVote}
				onSubmit={handleSuggestTag}
				submitLabel="Suggest Tag"
				isFormDisabled={!selectedTagId()}
				formContent={
					<Select
						options={tagOptions()}
						value={selectedTagId()}
						onChange={setSelectedTagId}
						placeholder="Select a tag..."
						size="sm"
					/>
				}
			/>

			<SuggestionModal
				open={packageModalOpen()}
				onOpenChange={setPackageModalOpen}
				title="Suggest Packages"
				description="Help grow this ecosystem by suggesting relevant packages."
				isLoggedIn={isLoggedIn()}
				onLoginClick={handleLogin}
				currentUserId={currentUserId()}
				pendingSuggestions={packageSuggestions()}
				onVote={handleVote}
				onSubmit={handleSuggestPackage}
				submitLabel="Suggest Package"
				isFormDisabled={!selectedPackageId()}
				formContent={
					<Stack spacing="sm">
						<input
							type="text"
							value={packageSearchQuery()}
							onInput={(e) => setPackageSearchQuery(e.currentTarget.value)}
							placeholder="Search packages..."
							class="flex h-10 w-full rounded-radius border border-outline dark:border-outline-dark bg-transparent px-3 py-2 text-sm placeholder:text-on-surface-subtle dark:placeholder:text-on-surface-dark-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-dark"
						/>
						<Show when={packageSearchQuery().length > 0}>
							<Select
								options={packageOptions()}
								value={selectedPackageId()}
								onChange={setSelectedPackageId}
								placeholder="Select a package..."
								size="sm"
							/>
						</Show>
					</Stack>
				}
			/>
		</Layout>
	);
};

import {
	getSuggestionTypeLabel,
	mutators,
	queries,
	useQuery,
	useZero,
} from "@package/database/client";
import { A, useParams } from "@solidjs/router";
import { createMemo, createSignal, Show } from "solid-js";
import { SearchInput } from "@/components/composite/search-input";
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
import { Textarea } from "@/components/primitives/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { useAddToProject } from "@/hooks/useAddToProject";
import { useSuggestionSubmit } from "@/hooks/useSuggestionSubmit";
import { useVote } from "@/hooks/useVote";
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

	// Add to project
	const addToProject = useAddToProject(() => ({
		entityType: "ecosystem",
		entityId: ecosystem()?.id ?? "",
	}));

	// Tags
	const tags = createMemo(() => {
		const eco = ecosystem();
		if (!eco?.ecosystemTags) return [];
		return eco.ecosystemTags
			.filter(
				(et): et is typeof et & { tag: NonNullable<typeof et.tag> } => !!et.tag,
			)
			.map((et) => ({ id: et.tagId, name: et.tag.name, slug: et.tag.slug }));
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

	const pendingRemoveTagIds = createMemo(() => {
		const suggestions = pendingSuggestions() ?? [];
		return new Set(
			suggestions
				.filter((s) => s.type === "remove_ecosystem_tag")
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

	// Remove tag modal
	const [removeTagModalOpen, setRemoveTagModalOpen] = createSignal(false);
	const [removeTagId, setRemoveTagId] = createSignal<string | null>(null);
	const [removeTagJustification, setRemoveTagJustification] = createSignal("");

	const removeTagName = createMemo(() => {
		const tagId = removeTagId();
		return tagId ? (tagsById().get(tagId)?.name ?? "Unknown") : "";
	});

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

	const { submit: submitAddTag } = useSuggestionSubmit({
		type: "add_ecosystem_tag",
		entityId: { ecosystemId: ecosystem()?.id },
		getPayload: () => ({ tagId: selectedTagId() }),
		onSuccess: () => {
			setSelectedTagId(undefined);
			setTagModalOpen(false);
		},
	});

	const handleSuggestTag = (justification?: string) => {
		if (!ecosystem() || !selectedTagId()) return;
		submitAddTag(justification);
	};

	// Package suggestion modal
	const [packageModalOpen, setPackageModalOpen] = createSignal(false);
	const [packageSearchQuery, setPackageSearchQuery] = createSignal("");

	const [searchResults, searchResultsResult] = useQuery(() =>
		queries.packages.search({
			query: packageSearchQuery() || undefined,
			limit: 10,
		}),
	);
	const isSearching = () =>
		packageSearchQuery().length > 0 &&
		searchResultsResult().type !== "complete";

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

	const packagePickerItems = createMemo(() =>
		availablePackages().map((p) => ({
			id: p.id,
			primary: p.name,
			secondary: p.description ?? undefined,
			label: p.registry,
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

	const { submit: submitAddPackage } = useSuggestionSubmit({
		type: "add_ecosystem_package",
		entityId: { ecosystemId: ecosystem()?.id },
		getPayload: () => ({ packageId: selectedPackageId() }),
		onSuccess: () => {
			setSelectedPackageId(undefined);
			setPackageSearchQuery("");
			setPackageModalOpen(false);
		},
	});

	const handleSuggestPackage = (justification?: string) => {
		if (!ecosystem() || !selectedPackageId()) return;
		submitAddPackage(justification);
	};

	const { vote: handleVote } = useVote();

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

	const handleRemoveTag = (tagId: string) => {
		const eco = ecosystem();
		if (!eco) return;

		if (!isLoggedIn()) {
			toast.info("Sign in to suggest tag removal.", "Sign in required");
			return;
		}

		if (pendingRemoveTagIds().has(tagId)) {
			toast.info(
				"A suggestion to remove this tag is already pending.",
				"Already pending",
			);
			return;
		}

		setRemoveTagId(tagId);
		setRemoveTagJustification("");
		setRemoveTagModalOpen(true);
	};

	const { submit: submitRemoveTag } = useSuggestionSubmit({
		type: "remove_ecosystem_tag",
		entityId: { ecosystemId: ecosystem()?.id },
		getPayload: () => ({ tagId: removeTagId() }),
		onSuccess: () => {
			setRemoveTagModalOpen(false);
			setRemoveTagId(null);
			setRemoveTagJustification("");
		},
	});

	const handleConfirmRemoveTag = () => {
		if (!ecosystem() || !removeTagId()) return;
		submitRemoveTag(removeTagJustification() || undefined);
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
										ecosystemId={eco().id}
										name={eco().name}
										description={eco().description}
										website={eco().website}
										tags={tags()}
										pendingRemoveTagIds={pendingRemoveTagIds()}
										upvoteCount={eco().upvoteCount}
										hasUpvoted={hasUpvoted()}
										isLoggedIn={isLoggedIn()}
										onUpvote={handleUpvote}
										onAddTag={handleAddTag}
										onRemoveTag={handleRemoveTag}
										projects={addToProject.projects()}
										isInProject={addToProject.isInProject}
										onAddToProject={addToProject.onAdd}
										addingToProjectId={addToProject.addingToProjectId()}
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
					<SearchInput
						value={packageSearchQuery()}
						onValueChange={setPackageSearchQuery}
						results={packagePickerItems()}
						isLoading={isSearching()}
						onSelect={(item) => setSelectedPackageId(item.id)}
						onClear={() => setSelectedPackageId(undefined)}
						placeholder="Search packages..."
						noResultsMessage="No matching packages found"
					/>
				}
			/>

			<Dialog
				open={removeTagModalOpen()}
				onOpenChange={setRemoveTagModalOpen}
				title="Remove Tag"
				description={`Are you sure you want to suggest removing the "${removeTagName()}" tag?`}
			>
				<Stack spacing="md">
					<Textarea
						value={removeTagJustification()}
						onInput={(e) => setRemoveTagJustification(e.currentTarget.value)}
						placeholder="Why should this tag be removed? (optional)"
						rows={3}
						size="sm"
					/>
					<Flex gap="sm" justify="end">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setRemoveTagModalOpen(false)}
						>
							Cancel
						</Button>
						<Button variant="danger" size="sm" onClick={handleConfirmRemoveTag}>
							Submit Suggestion
						</Button>
					</Flex>
				</Stack>
			</Dialog>
		</Layout>
	);
};

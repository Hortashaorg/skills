import type { Row } from "@package/database/client";
import { mutators, queries, useQuery, useZero } from "@package/database/client";
import { createSignal, For, Show } from "solid-js";
import { SEO } from "@/components/composite/seo";
import { EcosystemCard } from "@/components/feature/ecosystem-card";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Input } from "@/components/primitives/input";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
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
import { Layout } from "@/layout/Layout";
import { getAuthorizationUrl, saveReturnUrl } from "@/lib/auth-url";
import { EcosystemTagFilter } from "./sections/EcosystemTagFilter";

type EcosystemTag = Row["ecosystemTags"] & {
	tag?: Row["tags"];
};

type Ecosystem = Row["ecosystems"] & {
	upvotes?: readonly Row["ecosystemUpvotes"][];
	ecosystemPackages?: readonly Row["ecosystemPackages"][];
	ecosystemTags?: readonly EcosystemTag[];
};

export const Ecosystems = () => {
	const zero = useZero();
	const isLoggedIn = () => zero().userID !== "anon";

	const [searchValue, setSearchValue] = createUrlStringSignal("q");
	const [selectedTagSlugs, setSelectedTagSlugs] = createUrlArraySignal("tags");
	const searchTerm = () => searchValue().trim();

	const [ecosystems, ecosystemsResult] = useQuery(() =>
		queries.ecosystems.search({
			query: searchTerm() || undefined,
			tagSlugs: selectedTagSlugs().length > 0 ? selectedTagSlugs() : undefined,
		}),
	);
	const [pendingSuggestions] = useQuery(() =>
		queries.suggestions.pendingCreateEcosystem(),
	);

	const isLoading = () => ecosystemsResult().type !== "complete";

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
				mutators.suggestions.createCreateEcosystem({
					name: ecosystemName,
					description: description().trim() || undefined,
					website: website().trim() || undefined,
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
			<Container size="md">
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
						<EcosystemTagFilter
							selectedTagSlugs={selectedTagSlugs()}
							onTagsChange={setSelectedTagSlugs}
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

					<Show
						when={!isLoading()}
						fallback={<Text color="muted">Loading ecosystems...</Text>}
					>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{/* Suggest ecosystem card - always visible */}
							<Card padding="md" class="flex flex-col justify-center">
								<Stack spacing="sm">
									<Text weight="medium">{suggestCardText()}</Text>
									<Show
										when={isLoggedIn()}
										fallback={
											<Button
												variant="primary"
												size="sm"
												onClick={() => {
													saveReturnUrl();
													window.location.href = getAuthorizationUrl();
												}}
											>
												Sign in to suggest
											</Button>
										}
									>
										<Button
											variant="primary"
											size="sm"
											onClick={() =>
												openSuggestDialog(searchTerm() || undefined)
											}
										>
											Suggest ecosystem
										</Button>
									</Show>
								</Stack>
							</Card>

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
						</div>

						<Show when={(ecosystems()?.length ?? 0) > 0}>
							<Text size="sm" color="muted" class="text-center">
								Showing {ecosystems()?.length} ecosystems
							</Text>
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

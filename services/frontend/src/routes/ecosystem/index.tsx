import { mutators, queries, useQuery, useZero } from "@package/database/client";
import { A, useNavigate, useParams } from "@solidjs/router";
import { createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import { SEO } from "@/components/composite/seo";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { PlusIcon } from "@/components/primitives/icon";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import {
	TextField,
	TextFieldInput,
	TextFieldLabel,
} from "@/components/ui/text-field";
import { toast } from "@/components/ui/toast";
import { Layout } from "@/layout/Layout";
import { buildPackageUrl } from "@/lib/url";
import { CurateTab } from "./sections/CurateTab";

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

		<Card padding="lg">
			<Stack spacing="md">
				<Skeleton variant="text" width="120px" height="24px" />
				<div class="grid gap-2 md:grid-cols-2">
					<Skeleton variant="rectangular" height="60px" />
					<Skeleton variant="rectangular" height="60px" />
					<Skeleton variant="rectangular" height="60px" />
					<Skeleton variant="rectangular" height="60px" />
				</div>
			</Stack>
		</Card>
	</Stack>
);

export const Ecosystem = () => {
	const params = useParams<{ slug: string; tab?: string }>();
	const navigate = useNavigate();
	const zero = useZero();

	const slug = () => decodeURIComponent(params.slug);
	const tab = () => params.tab ?? "overview";
	const baseUrl = () => `/ecosystem/${encodeURIComponent(slug())}`;

	const [ecosystemData, ecosystemResult] = useQuery(() =>
		queries.ecosystems.bySlug({ slug: slug() }),
	);

	const isLoading = () => ecosystemResult().type !== "complete";
	const ecosystem = createMemo(() => ecosystemData()?.[0] ?? null);

	const isLoggedIn = () => zero().userID !== "anon";

	const userUpvote = createMemo(() => {
		const eco = ecosystem();
		if (!eco?.upvotes) return null;
		return eco.upvotes.find((u) => u.accountId === zero().userID) ?? null;
	});

	const hasUpvoted = () => !!userUpvote();

	const existingPackageIds = createMemo(() => {
		const eco = ecosystem();
		if (!eco?.ecosystemPackages) return new Set<string>();
		return new Set(
			eco.ecosystemPackages
				.map((ep) => ep.package?.id)
				.filter(Boolean) as string[],
		);
	});

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

	// Package suggestion dialog
	const [packageDialogOpen, setPackageDialogOpen] = createSignal(false);
	const [packageSearchQuery, setPackageSearchQuery] = createSignal("");

	const [searchResults] = useQuery(() =>
		queries.packages.search({
			query: packageSearchQuery() || undefined,
			limit: 10,
		}),
	);

	// Tag suggestion dialog
	const [tagDialogOpen, setTagDialogOpen] = createSignal(false);
	const [tagSearchQuery, setTagSearchQuery] = createSignal("");

	const [tagSearchResults] = useQuery(() =>
		queries.tags.search({
			query: tagSearchQuery() || undefined,
			limit: 10,
		}),
	);

	const [pendingSuggestions] = useQuery(() => {
		const eco = ecosystem();
		if (!eco) return null;
		return queries.suggestions.pendingForEcosystem({ ecosystemId: eco.id });
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

	const pendingTagIds = createMemo(() => {
		const suggestions = pendingSuggestions() ?? [];
		return new Set(
			suggestions
				.filter((s) => s.type === "add_ecosystem_tag")
				.map((s) => (s.payload as { tagId?: string })?.tagId)
				.filter(Boolean) as string[],
		);
	});

	const existingTagIds = createMemo(() => {
		const eco = ecosystem();
		if (!eco?.ecosystemTags) return new Set<string>();
		return new Set(eco.ecosystemTags.map((et) => et.tagId));
	});

	const tags = createMemo(() => {
		const eco = ecosystem();
		if (!eco?.ecosystemTags) return [];
		return eco.ecosystemTags
			.filter(
				(et): et is typeof et & { tag: NonNullable<typeof et.tag> } => !!et.tag,
			)
			.map((et) => et.tag);
	});

	const availableTags = createMemo(() => {
		const results = tagSearchResults() ?? [];
		const existing = existingTagIds();
		const pending = pendingTagIds();
		return results.filter(
			(tag) => !existing.has(tag.id) && !pending.has(tag.id),
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

	const handleSuggestPackage = (packageId: string) => {
		const eco = ecosystem();
		if (!eco) return;

		try {
			zero().mutate(
				mutators.suggestions.createAddEcosystemPackage({
					ecosystemId: eco.id,
					packageId,
				}),
			);
			setPackageSearchQuery("");
			setPackageDialogOpen(false);
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

	const handleSuggestTag = (tagId: string) => {
		const eco = ecosystem();
		if (!eco) return;

		try {
			zero().mutate(
				mutators.suggestions.createAddEcosystemTag({
					ecosystemId: eco.id,
					tagId,
				}),
			);
			setTagSearchQuery("");
			setTagDialogOpen(false);
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

	const handleAddPackageClick = () => {
		if (!isLoggedIn()) {
			toast.info("Sign in to suggest packages.", "Sign in required");
			return;
		}
		setPackageDialogOpen(true);
	};

	const handleAddTagClick = () => {
		if (!isLoggedIn()) {
			toast.info("Sign in to suggest tags.", "Sign in required");
			return;
		}
		setTagDialogOpen(true);
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
			<Container size="md">
				<Stack spacing="lg" class="py-8">
					<Show when={!isLoading()} fallback={<EcosystemSkeleton />}>
						<Show
							when={ecosystem()}
							fallback={
								<Card padding="lg">
									<Stack spacing="md" align="center">
										<Text color="muted">Ecosystem not found.</Text>
										<A href="/ecosystems">
											<Button variant="outline">Browse Ecosystems</Button>
										</A>
									</Stack>
								</Card>
							}
						>
							{(eco) => (
								<>
									<Stack spacing="md">
										<Flex justify="between" align="start" wrap="wrap" gap="md">
											<Stack spacing="xs">
												<Heading level="h1">{eco().name}</Heading>
												<Show when={eco().description}>
													<Text color="muted">{eco().description}</Text>
												</Show>
												<Show when={eco().website} keyed>
													{(website) => (
														<a
															href={website}
															target="_blank"
															rel="noopener noreferrer"
															class="text-sm text-accent hover:underline"
														>
															{website}
														</a>
													)}
												</Show>
												<Flex gap="xs" wrap="wrap" align="center">
													<For each={tags()}>
														{(tag) => (
															<A href={`/?tag=${tag.slug}`}>
																<Badge variant="secondary" size="sm">
																	{tag.name}
																</Badge>
															</A>
														)}
													</For>
													<button
														type="button"
														onClick={handleAddTagClick}
														class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border border-dashed border-outline hover:border-accent hover:text-accent dark:border-outline-dark dark:hover:border-accent transition-colors"
													>
														<PlusIcon size="xs" />
														<span>Add tag</span>
													</button>
												</Flex>
											</Stack>

											<Flex gap="sm" align="center">
												<Text size="sm" color="muted">
													{eco().upvoteCount} upvotes
												</Text>
												<Show when={isLoggedIn()}>
													<Button
														variant={hasUpvoted() ? "primary" : "outline"}
														size="sm"
														onClick={handleUpvote}
													>
														{hasUpvoted() ? "Upvoted" : "Upvote"}
													</Button>
												</Show>
											</Flex>
										</Flex>
									</Stack>

									<Card class="overflow-hidden">
										<Tabs.Root
											value={tab()}
											onChange={(value) => {
												navigate(
													value === "overview"
														? baseUrl()
														: `${baseUrl()}/${value}`,
												);
											}}
										>
											<Tabs.List variant="contained">
												<Tabs.Trigger value="overview" variant="contained">
													Packages
												</Tabs.Trigger>
												<Tabs.Trigger value="suggest" variant="contained">
													Suggest
												</Tabs.Trigger>
											</Tabs.List>
										</Tabs.Root>

										<div class="p-4">
											<Switch>
												<Match when={tab() === "overview"}>
													<div class="grid gap-2 md:grid-cols-2">
														<For each={eco().ecosystemPackages}>
															{(ep) => (
																<Show when={ep.package}>
																	{(pkg) => (
																		<A
																			href={buildPackageUrl(
																				pkg().registry,
																				pkg().name,
																			)}
																		>
																			<Card
																				padding="sm"
																				class="transition-colors hover:bg-accent/5"
																			>
																				<Flex justify="between" align="center">
																					<Stack spacing="xs">
																						<Text weight="medium">
																							{pkg().name}
																						</Text>
																						<Badge
																							variant="secondary"
																							size="sm"
																						>
																							{pkg().registry}
																						</Badge>
																					</Stack>
																					<Show when={pkg().latestVersion}>
																						<Text size="xs" color="muted">
																							{pkg().latestVersion}
																						</Text>
																					</Show>
																				</Flex>
																			</Card>
																		</A>
																	)}
																</Show>
															)}
														</For>

														{/* Suggest package action card */}
														<button
															type="button"
															onClick={handleAddPackageClick}
															class="text-left"
														>
															<Card
																padding="sm"
																class="h-full border-dashed transition-colors hover:bg-accent/5 hover:border-accent"
															>
																<Flex
																	align="center"
																	gap="sm"
																	class="h-full py-2"
																>
																	<div class="rounded-full bg-accent/10 p-2">
																		<PlusIcon size="sm" class="text-accent" />
																	</div>
																	<Stack spacing="xs">
																		<Text weight="medium" color="muted">
																			Suggest Package
																		</Text>
																		<Text size="xs" color="muted">
																			Add a package to this ecosystem
																		</Text>
																	</Stack>
																</Flex>
															</Card>
														</button>
													</div>

													<Show
														when={(eco().ecosystemPackages?.length ?? 0) === 0}
													>
														<Text
															size="sm"
															color="muted"
															class="text-center mt-4"
														>
															No packages in this ecosystem yet. Be the first to
															suggest one!
														</Text>
													</Show>
												</Match>

												<Match when={tab() === "suggest"}>
													<CurateTab ecosystemId={eco().id} />
												</Match>
											</Switch>
										</div>
									</Card>
								</>
							)}
						</Show>
					</Show>
				</Stack>
			</Container>

			<Dialog
				title="Suggest Package"
				description="Search for a package to add to this ecosystem."
				open={packageDialogOpen()}
				onOpenChange={setPackageDialogOpen}
			>
				<Stack spacing="md">
					<TextField>
						<TextFieldLabel>Search Packages</TextFieldLabel>
						<TextFieldInput
							placeholder="Search for a package..."
							value={packageSearchQuery()}
							onInput={(e) => setPackageSearchQuery(e.currentTarget.value)}
						/>
					</TextField>

					<Show when={packageSearchQuery().length > 0}>
						<Show
							when={availablePackages().length > 0}
							fallback={
								<Text size="sm" color="muted">
									No matching packages found (or already added/pending).
								</Text>
							}
						>
							<Stack spacing="xs" class="max-h-64 overflow-y-auto">
								<For each={availablePackages()}>
									{(pkg) => (
										<button
											type="button"
											onClick={() => handleSuggestPackage(pkg.id)}
											class="flex items-center justify-between p-2 border border-outline dark:border-outline-dark rounded-radius hover:bg-accent/5 text-left w-full"
										>
											<div>
												<Flex gap="xs" align="center">
													<Text size="sm" weight="medium">
														{pkg.name}
													</Text>
													<Badge variant="secondary" size="sm">
														{pkg.registry}
													</Badge>
												</Flex>
												<Show when={pkg.description}>
													<Text size="xs" color="muted" class="line-clamp-1">
														{pkg.description}
													</Text>
												</Show>
											</div>
										</button>
									)}
								</For>
							</Stack>
						</Show>
					</Show>

					<Flex gap="sm" justify="end">
						<Button
							size="sm"
							variant="outline"
							onClick={() => {
								setPackageDialogOpen(false);
								setPackageSearchQuery("");
							}}
						>
							Cancel
						</Button>
					</Flex>
					<Text size="xs" color="muted">
						Suggestions need community votes to be approved.
					</Text>
				</Stack>
			</Dialog>

			<Dialog
				title="Suggest Tag"
				description="Search for a tag to add to this ecosystem."
				open={tagDialogOpen()}
				onOpenChange={setTagDialogOpen}
			>
				<Stack spacing="md">
					<TextField>
						<TextFieldLabel>Search Tags</TextFieldLabel>
						<TextFieldInput
							placeholder="Search for a tag..."
							value={tagSearchQuery()}
							onInput={(e) => setTagSearchQuery(e.currentTarget.value)}
						/>
					</TextField>

					<Show when={tagSearchQuery().length > 0}>
						<Show
							when={availableTags().length > 0}
							fallback={
								<Text size="sm" color="muted">
									No matching tags found (or already added/pending).
								</Text>
							}
						>
							<Stack spacing="xs" class="max-h-64 overflow-y-auto">
								<For each={availableTags()}>
									{(tag) => (
										<button
											type="button"
											onClick={() => handleSuggestTag(tag.id)}
											class="flex items-center justify-between p-2 border border-outline dark:border-outline-dark rounded-radius hover:bg-accent/5 text-left w-full"
										>
											<div>
												<Text size="sm" weight="medium">
													{tag.name}
												</Text>
												<Show when={tag.description}>
													<Text size="xs" color="muted" class="line-clamp-1">
														{tag.description}
													</Text>
												</Show>
											</div>
										</button>
									)}
								</For>
							</Stack>
						</Show>
					</Show>

					<Flex gap="sm" justify="end">
						<Button
							size="sm"
							variant="outline"
							onClick={() => {
								setTagDialogOpen(false);
								setTagSearchQuery("");
							}}
						>
							Cancel
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

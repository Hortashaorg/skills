import { mutators, queries, useQuery, useZero } from "@package/database/client";
import { A, useParams } from "@solidjs/router";
import { createMemo, For, Show } from "solid-js";
import { SEO } from "@/components/composite/seo";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/layout/Layout";
import { buildPackageUrl } from "@/lib/url";

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
	const params = useParams<{ slug: string }>();
	const zero = useZero();

	const slug = () => decodeURIComponent(params.slug);

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

	const handleUpvote = async () => {
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

									<Card padding="lg">
										<Stack spacing="md">
											<Flex justify="between" align="center">
												<Heading level="h2">
													Packages ({eco().ecosystemPackages?.length ?? 0})
												</Heading>
											</Flex>

											<Show
												when={(eco().ecosystemPackages?.length ?? 0) > 0}
												fallback={
													<Text color="muted" size="sm">
														No packages in this ecosystem yet.
													</Text>
												}
											>
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
																					<Badge variant="secondary" size="sm">
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
												</div>
											</Show>
										</Stack>
									</Card>
								</>
							)}
						</Show>
					</Show>
				</Stack>
			</Container>
		</Layout>
	);
};

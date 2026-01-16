import { queries, useQuery } from "@package/database/client";
import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { SEO } from "@/components/composite/seo";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
import { Layout } from "@/layout/Layout";

export const Ecosystems = () => {
	const [ecosystems, ecosystemsResult] = useQuery(() =>
		queries.ecosystems.list(),
	);

	const isLoading = () => ecosystemsResult().type !== "complete";

	return (
		<Layout>
			<SEO
				title="Ecosystems"
				description="Explore technology ecosystems like React, AWS, Kubernetes and discover their related packages."
			/>
			<Container size="lg">
				<Stack spacing="lg" class="py-8">
					<Stack spacing="sm" align="center">
						<Heading level="h1" class="text-center">
							Ecosystems
						</Heading>
						<Text color="muted" class="text-center" as="p">
							Technology ecosystems and their related packages
						</Text>
					</Stack>

					<Show
						when={!isLoading()}
						fallback={<Text color="muted">Loading ecosystems...</Text>}
					>
						<Show
							when={(ecosystems()?.length ?? 0) > 0}
							fallback={
								<Card padding="lg">
									<Stack spacing="md" align="center">
										<Text color="muted">No ecosystems yet.</Text>
										<Text size="sm" color="muted">
											Ecosystems are community-curated. Suggest one in the
											curation section!
										</Text>
									</Stack>
								</Card>
							}
						>
							<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								<For each={ecosystems()}>
									{(ecosystem) => (
										<A href={`/ecosystem/${ecosystem.slug}`}>
											<Card
												padding="md"
												class="h-full transition-colors hover:bg-accent/5"
											>
												<Stack spacing="sm">
													<Flex justify="between" align="start">
														<Heading level="h3">{ecosystem.name}</Heading>
														<Text size="sm" color="muted">
															{ecosystem.upvoteCount} upvotes
														</Text>
													</Flex>
													<Show when={ecosystem.description}>
														<Text size="sm" color="muted" class="line-clamp-2">
															{ecosystem.description}
														</Text>
													</Show>
													<Text size="xs" color="muted">
														{ecosystem.ecosystemPackages?.length ?? 0} packages
													</Text>
												</Stack>
											</Card>
										</A>
									)}
								</For>
							</div>
						</Show>

						<Show when={(ecosystems()?.length ?? 0) > 0}>
							<Text size="sm" color="muted" class="text-center">
								Showing {ecosystems()?.length} ecosystems
							</Text>
						</Show>
					</Show>
				</Stack>
			</Container>
		</Layout>
	);
};

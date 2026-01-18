import { mutators, queries, useQuery, useZero } from "@package/database/client";
import { A } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";
import { SEO } from "@/components/composite/seo";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { PlusIcon } from "@/components/primitives/icon";
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
import { Layout } from "@/layout/Layout";

export const Ecosystems = () => {
	const zero = useZero();
	const isLoggedIn = () => zero().userID !== "anon";

	const [ecosystems, ecosystemsResult] = useQuery(() =>
		queries.ecosystems.list(),
	);

	const isLoading = () => ecosystemsResult().type !== "complete";

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

	const handleCardClick = () => {
		if (!isLoggedIn()) {
			toast.info("Sign in to suggest ecosystems.", "Sign in required");
			return;
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

							{/* Suggest ecosystem action card */}
							<button type="button" onClick={handleCardClick} class="text-left">
								<Card
									padding="md"
									class="h-full border-dashed transition-colors hover:bg-accent/5 hover:border-accent"
								>
									<Stack spacing="sm" align="center" class="py-4">
										<div class="rounded-full bg-accent/10 p-3">
											<PlusIcon size="md" class="text-accent" />
										</div>
										<Text weight="medium" color="muted">
											Suggest Ecosystem
										</Text>
										<Text size="xs" color="muted" class="text-center">
											Propose a new technology ecosystem
										</Text>
									</Stack>
								</Card>
							</button>
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

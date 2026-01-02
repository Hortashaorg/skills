import { useZero } from "@package/database/client";
import { A } from "@solidjs/router";
import { Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Layout } from "@/layout/Layout";
import { getAuthorizationUrl, saveReturnUrl } from "@/lib/auth-url";

const FeatureCard = (props: {
	title: string;
	description: string;
	icon: "packages" | "projects" | "collaborate";
}) => {
	const icons = {
		packages: (
			<svg
				class="w-8 h-8 text-primary dark:text-primary-dark"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<title>Packages</title>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
				/>
			</svg>
		),
		projects: (
			<svg
				class="w-8 h-8 text-primary dark:text-primary-dark"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<title>Projects</title>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
				/>
			</svg>
		),
		collaborate: (
			<svg
				class="w-8 h-8 text-primary dark:text-primary-dark"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<title>Collaborate</title>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
				/>
			</svg>
		),
	};

	return (
		<Card padding="lg" class="h-full">
			<Stack spacing="md">
				<div class="p-3 rounded-radius bg-primary/10 dark:bg-primary-dark/10 w-fit">
					{icons[props.icon]}
				</div>
				<Heading level="h3">{props.title}</Heading>
				<Text color="muted">{props.description}</Text>
			</Stack>
		</Card>
	);
};

export const Landing = () => {
	const zero = useZero();
	const isLoggedIn = () => zero().userID !== "anon";

	const handleSignIn = () => {
		saveReturnUrl();
		window.location.href = getAuthorizationUrl();
	};

	return (
		<Layout>
			<Container size="lg">
				<Stack spacing="xl" class="py-12">
					{/* Hero Section */}
					<Stack
						spacing="lg"
						align="center"
						class="text-center max-w-2xl mx-auto"
					>
						<Heading level="h1" class="text-4xl sm:text-5xl">
							Discover and organize your tech stack
						</Heading>
						<Text size="lg" color="muted" class="max-w-xl">
							TechGarden helps you explore packages across registries, organize
							them into projects, and share your discoveries with others.
						</Text>
						<Flex gap="md" wrap="wrap" justify="center">
							<A href="/packages">
								<Button variant="primary" size="lg">
									Browse Packages
								</Button>
							</A>
							<Show
								when={isLoggedIn()}
								fallback={
									<Button variant="outline" size="lg" onClick={handleSignIn}>
										Sign in
									</Button>
								}
							>
								<A href="/me/projects">
									<Button variant="outline" size="lg">
										Your Projects
									</Button>
								</A>
							</Show>
						</Flex>
					</Stack>

					{/* Features Section */}
					<Stack spacing="lg" class="pt-8">
						<Heading level="h2" class="text-center">
							What you can do
						</Heading>
						<div class="grid gap-6 md:grid-cols-3">
							<FeatureCard
								icon="packages"
								title="Explore Packages"
								description="Search packages from npm, JSR, and more. View details, dependencies, and community upvotes."
							/>
							<FeatureCard
								icon="projects"
								title="Create Projects"
								description="Organize packages into projects. Track your tech stack for different applications or learning paths."
							/>
							<FeatureCard
								icon="collaborate"
								title="Share & Discover"
								description="All projects are public. Learn from others' tech stacks and share your own discoveries."
							/>
						</div>
					</Stack>

					{/* CTA Section */}
					<Card padding="lg" class="text-center mt-8">
						<Stack spacing="md" align="center">
							<Heading level="h2">Ready to get started?</Heading>
							<Text color="muted">
								Browse packages to find tools for your next project.
							</Text>
							<A href="/packages">
								<Button variant="primary">Start Exploring</Button>
							</A>
						</Stack>
					</Card>
				</Stack>
			</Container>
		</Layout>
	);
};

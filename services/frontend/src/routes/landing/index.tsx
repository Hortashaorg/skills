import { useZero } from "@package/database/client";
import { A } from "@solidjs/router";
import { Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Layout } from "@/layout/Layout";
import { getAuthorizationUrl, saveReturnUrl } from "@/lib/auth-url";

const FeatureCard = (props: {
	title: string;
	description: string;
	icon: "packages" | "projects" | "collaborate";
	href?: string;
	linkText?: string;
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
				<Show when={props.href}>
					<A
						href={props.href ?? ""}
						class="text-sm text-primary dark:text-primary-dark hover:underline mt-auto"
					>
						{props.linkText} →
					</A>
				</Show>
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
						<Badge variant="info">Work in Progress</Badge>
						<Heading level="h1" class="text-4xl sm:text-5xl">
							TechGarden
						</Heading>
						<Text size="lg" color="muted" class="max-w-xl">
							An experiment in package discovery and curation. Browse packages,
							organize them into projects, and see what grows.
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

					{/* What's Here Section */}
					<Stack spacing="lg" class="pt-8">
						<Heading level="h2" class="text-center">
							What's here so far
						</Heading>
						<div class="grid gap-6 md:grid-cols-3">
							<FeatureCard
								icon="packages"
								title="Package Browser"
								description="Search npm packages, view their details and dependencies. Request packages to add them to the database."
								href="/packages"
								linkText="Browse packages"
							/>
							<FeatureCard
								icon="projects"
								title="Projects"
								description="Create collections of packages. Useful for tracking tech stacks, learning paths, or just bookmarking."
								href="/projects"
								linkText="See projects"
							/>
							<FeatureCard
								icon="collaborate"
								title="Public by Default"
								description="All projects are public. Maybe that becomes useful for discovery later, we'll see."
							/>
						</div>
					</Stack>
				</Stack>
			</Container>
		</Layout>
	);
};

import { useZero } from "@package/database/client";
import { A } from "@solidjs/router";
import type { JSX } from "solid-js";
import { Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import {
	FolderIcon,
	PackageIcon,
	UsersIcon,
} from "@/components/primitives/icon";
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
	icon: JSX.Element;
	href?: string;
	linkText?: string;
}) => {
	return (
		<Card padding="lg" class="h-full">
			<Stack spacing="md">
				<div class="p-3 rounded-radius bg-primary/10 dark:bg-primary-dark/10 w-fit">
					{props.icon}
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
								icon={
									<PackageIcon
										size="xl"
										class="text-primary dark:text-primary-dark"
									/>
								}
								title="Package Browser"
								description="Search npm packages, view their details and dependencies. Request packages to add them to the database."
								href="/packages"
								linkText="Browse packages"
							/>
							<FeatureCard
								icon={
									<FolderIcon
										size="xl"
										class="text-primary dark:text-primary-dark"
									/>
								}
								title="Projects"
								description="Create collections of packages. Useful for tracking tech stacks, learning paths, or just bookmarking."
								href="/projects"
								linkText="See projects"
							/>
							<FeatureCard
								icon={
									<UsersIcon
										size="xl"
										class="text-primary dark:text-primary-dark"
									/>
								}
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

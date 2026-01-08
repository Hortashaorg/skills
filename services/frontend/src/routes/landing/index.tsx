import { queries, useQuery, useZero } from "@package/database/client";
import { A } from "@solidjs/router";
import type { JSX } from "solid-js";
import { createMemo, Show } from "solid-js";
import { SEO } from "@/components/composite/seo";
import {
	type LeaderboardEntry,
	LeaderboardPreview,
} from "@/components/feature/leaderboard-preview";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import {
	FolderIcon,
	PackageIcon,
	TrophyIcon,
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
				<div class="p-3 rounded-radius bg-brand/10 dark:bg-brand-dark/10 w-fit">
					{props.icon}
				</div>
				<Heading level="h3">{props.title}</Heading>
				<Text color="muted">{props.description}</Text>
				<Show when={props.href}>
					<A
						href={props.href ?? ""}
						class="text-sm text-brand dark:text-brand-dark hover:underline mt-auto"
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

	const [monthlyData, monthlyResult] = useQuery(() =>
		queries.contributionScores.leaderboardMonthly({ limit: 5 }),
	);

	const [allTimeData, allTimeResult] = useQuery(() =>
		queries.contributionScores.leaderboardAllTime({ limit: 5 }),
	);

	const monthlyEntries = createMemo((): readonly LeaderboardEntry[] => {
		const data = monthlyData();
		if (!data) return [];

		return data
			.filter((entry) => entry.monthlyScore > 0)
			.map((entry, index) => ({
				rank: index + 1,
				name: entry.account?.name ?? "Unknown",
				score: entry.monthlyScore,
				isCurrentUser: entry.accountId === zero().userID,
			}));
	});

	const allTimeEntries = createMemo((): readonly LeaderboardEntry[] => {
		const data = allTimeData();
		if (!data) return [];

		return data
			.filter((entry) => entry.allTimeScore > 0)
			.map((entry, index) => ({
				rank: index + 1,
				name: entry.account?.name ?? "Unknown",
				score: entry.allTimeScore,
				isCurrentUser: entry.accountId === zero().userID,
			}));
	});

	const showLeaderboards = () =>
		monthlyResult().type === "complete" &&
		allTimeResult().type === "complete" &&
		(monthlyEntries().length > 0 || allTimeEntries().length > 0);

	const handleSignIn = () => {
		saveReturnUrl();
		window.location.href = getAuthorizationUrl();
	};

	return (
		<Layout>
			<SEO description="Discover packages through the eyes of developers. See what the community recommends, organize your own collections, and watch them grow." />
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
						<Text size="xl" class="max-w-xl">
							Discover packages through the eyes of developers.
						</Text>
						<Text color="muted" class="max-w-xl">
							Not just download counts — see what the community actually
							recommends. Organize your own collections, share your discoveries,
							and watch them grow.
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
										class="text-brand dark:text-brand-dark"
									/>
								}
								title="Package Browser"
								description="Search packages, view their details and dependencies. Request new packages to add them to the garden."
								href="/packages"
								linkText="Browse packages"
							/>
							<FeatureCard
								icon={
									<FolderIcon
										size="xl"
										class="text-brand dark:text-brand-dark"
									/>
								}
								title="Projects"
								description="Create collections of packages. Track your tech stacks, learning paths, or bookmark favorites."
								href="/projects"
								linkText="See projects"
							/>
							<FeatureCard
								icon={
									<TrophyIcon
										size="xl"
										class="text-brand dark:text-brand-dark"
									/>
								}
								title="Community Curation"
								description="Help improve package discovery. Vote on suggestions, earn points, and climb the leaderboard."
								href={isLoggedIn() ? "/curation" : undefined}
								linkText="Start curating"
							/>
						</div>
					</Stack>

					{/* Top Contributors Section */}
					<Show when={showLeaderboards()}>
						<Stack spacing="lg" class="pt-8">
							<Heading level="h2" class="text-center">
								Top Contributors
							</Heading>
							<div class="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto w-full">
								<Show when={monthlyEntries().length > 0}>
									<LeaderboardPreview
										entries={monthlyEntries()}
										title="This Month"
										subtitle=""
										viewAllHref={isLoggedIn() ? "/curation" : undefined}
									/>
								</Show>
								<Show when={allTimeEntries().length > 0}>
									<LeaderboardPreview
										entries={allTimeEntries()}
										title="All Time"
										subtitle=""
										viewAllHref={isLoggedIn() ? "/curation" : undefined}
									/>
								</Show>
							</div>
						</Stack>
					</Show>
				</Stack>
			</Container>
		</Layout>
	);
};

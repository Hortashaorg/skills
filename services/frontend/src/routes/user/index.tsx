import { queries, useQuery, useZero } from "@package/database/client";
import { A, useParams } from "@solidjs/router";
import { createMemo, Show } from "solid-js";
import { SEO } from "@/components/composite/seo";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/layout/Layout";
import { getDisplayName } from "@/lib/account";
import { LEADERBOARD_LIMIT } from "@/lib/constants";
import { ActivityTimeline } from "./sections/ActivityTimeline";
import { ContributionStats } from "./sections/ContributionStats";
import { ProfileHeader } from "./sections/ProfileHeader";
import { UserProjects } from "./sections/UserProjects";

const ProfileSkeleton = () => (
	<Stack spacing="lg">
		<Stack spacing="md">
			<Skeleton variant="circular" width="80px" height="80px" />
			<Skeleton variant="text" width="200px" height="32px" />
			<Skeleton variant="text" width="150px" height="20px" />
		</Stack>
		<div class="grid gap-4 sm:grid-cols-3">
			<Skeleton variant="rectangular" height="80px" />
			<Skeleton variant="rectangular" height="80px" />
			<Skeleton variant="rectangular" height="80px" />
		</div>
		<Skeleton variant="rectangular" height="200px" />
	</Stack>
);

export const UserProfile = () => {
	const params = useParams<{ id: string }>();
	const zero = useZero();

	const isOwnProfile = () =>
		zero().userID !== "anon" && zero().userID === params.id;

	// Queries
	const [accountData, accountResult] = useQuery(() =>
		queries.account.byId({ id: params.id }),
	);

	const [contributionScore] = useQuery(() =>
		queries.contributionScores.forUser({ accountId: params.id }),
	);

	const [contributionEvents] = useQuery(() =>
		queries.contributionEvents.forUser({ accountId: params.id, limit: 20 }),
	);

	const [projects] = useQuery(() =>
		queries.projects.byAccountId({ accountId: params.id, limit: 6 }),
	);

	const [allTimeLeaderboard] = useQuery(() =>
		queries.contributionScores.leaderboardAllTime({ limit: LEADERBOARD_LIMIT }),
	);

	// Derived state
	const isLoading = () => accountResult().type !== "complete";
	const account = () => accountData();

	const monthlyScore = () => contributionScore()?.monthlyScore ?? 0;
	const allTimeScore = () => contributionScore()?.allTimeScore ?? 0;

	const rank = createMemo(() => {
		const leaderboard = allTimeLeaderboard();
		if (!leaderboard) return null;
		const index = leaderboard.findIndex((s) => s.accountId === params.id);
		return index >= 0 ? index + 1 : null;
	});

	const events = () => contributionEvents() ?? [];
	const userProjects = () => projects() ?? [];

	const displayName = () => getDisplayName(account());

	return (
		<Layout>
			<SEO
				title={displayName()}
				description={`View ${displayName()}'s profile and contributions on TechGarden.`}
			/>
			<Container size="lg">
				<Stack spacing="lg" class="py-8">
					<Show when={!isLoading()} fallback={<ProfileSkeleton />}>
						<Show
							when={account()}
							fallback={
								<Card padding="lg">
									<Stack spacing="md" align="center">
										<Heading level="h2">User not found</Heading>
										<Text color="muted">
											This user doesn't exist or has been removed.
										</Text>
										<A href="/">
											<Button variant="outline">Go Home</Button>
										</A>
									</Stack>
								</Card>
							}
						>
							{(acc) => (
								<Stack spacing="xl">
									<ProfileHeader
										account={acc()}
										isOwnProfile={isOwnProfile()}
									/>

									<ContributionStats
										monthlyScore={monthlyScore()}
										allTimeScore={allTimeScore()}
										rank={rank()}
									/>

									<ActivityTimeline events={events()} />

									<UserProjects projects={userProjects()} />
								</Stack>
							)}
						</Show>
					</Show>
				</Stack>
			</Container>
		</Layout>
	);
};

export default UserProfile;

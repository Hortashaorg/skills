import {
	queries,
	type Row,
	useConnectionState,
	useQuery,
} from "@package/database/client";
import { A, useNavigate, useParams } from "@solidjs/router";
import { createMemo, createSignal, Match, Show, Switch } from "solid-js";
import { QueryBoundary } from "@/components/composite/query-boundary";
import { SEO } from "@/components/composite/seo";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { Layout } from "@/layout/Layout";
import type { Registry } from "@/lib/registries";
import { buildPackageUrl } from "@/lib/url";
import { ChannelSelector } from "./sections/ChannelSelector";
import { Dependencies } from "./sections/Dependencies";
import { DetailsTab } from "./sections/DetailsTab";
import { DiscussionTab } from "./sections/DiscussionTab";
import { Header } from "./sections/Header";

type ReleaseChannel = Row["packageReleaseChannels"];

const PackageDetailSkeleton = () => (
	<Stack spacing="lg">
		{/* Header skeleton */}
		<Stack spacing="md">
			<Flex justify="between" align="start">
				<Stack spacing="xs" class="flex-1">
					<Skeleton variant="text" width="200px" height="32px" />
					<Skeleton variant="text" width="120px" height="20px" />
				</Stack>
				<Flex gap="sm">
					<Skeleton variant="rectangular" width="100px" height="36px" />
					<Skeleton variant="rectangular" width="80px" height="36px" />
				</Flex>
			</Flex>
			<Skeleton variant="text" width="80%" />
		</Stack>

		{/* Tags skeleton */}
		<Flex gap="sm">
			<Skeleton variant="rectangular" width="60px" height="24px" />
			<Skeleton variant="rectangular" width="80px" height="24px" />
			<Skeleton variant="rectangular" width="70px" height="24px" />
		</Flex>

		{/* Channel selector skeleton */}
		<Card padding="md">
			<Flex gap="sm">
				<Skeleton variant="rectangular" width="80px" height="32px" />
				<Skeleton variant="rectangular" width="80px" height="32px" />
			</Flex>
		</Card>

		{/* Dependencies skeleton */}
		<Card padding="lg">
			<Stack spacing="md">
				<Skeleton variant="text" width="120px" height="24px" />
				<div class="grid gap-2">
					<Skeleton variant="text" width="60%" />
					<Skeleton variant="text" width="45%" />
					<Skeleton variant="text" width="55%" />
				</div>
			</Stack>
		</Card>
	</Stack>
);

export const Package = () => {
	const params = useParams<{ registry: string; name: string; tab?: string }>();
	const navigate = useNavigate();

	// Decode URL params
	const registry = () => decodeURIComponent(params.registry) as Registry;
	const packageName = () => decodeURIComponent(params.name);
	const tab = () => params.tab || "overview";
	const baseUrl = () => buildPackageUrl(registry(), packageName());

	// Query package with channels
	const [packageData] = useQuery(() =>
		queries.packages.byNameWithChannels({
			name: packageName(),
			registry: registry(),
		}),
	);
	const connectionState = useConnectionState();

	// Loading state
	const isLoading = () =>
		packageData() === undefined || connectionState().name === "connecting";

	// Get the package (query filters by name + registry, should be 0 or 1 result)
	const pkg = createMemo(() => {
		const data = packageData();
		return data?.[0] ?? null;
	});

	// Sort channels: "latest" first, then alphabetically
	const sortedChannels = createMemo(() => {
		const p = pkg();
		if (!p?.releaseChannels?.length) return [];
		return [...p.releaseChannels].sort((a, b) => {
			if (a.channel === "latest") return -1;
			if (b.channel === "latest") return 1;
			return a.channel.localeCompare(b.channel);
		});
	});

	// Selected channel - defaults to "latest" or first available
	const [selectedChannelId, setSelectedChannelId] = createSignal<string>();

	// Find default channel (latest or first)
	const defaultChannel = createMemo((): ReleaseChannel | undefined => {
		const channels = sortedChannels();
		if (!channels.length) return undefined;
		return channels.find((c) => c.channel === "latest") ?? channels[0];
	});

	// Get effective selected channel
	const selectedChannel = createMemo(() => {
		const channels = sortedChannels();
		const id = selectedChannelId();
		if (!channels.length) return null;

		// Use selected if set, otherwise default
		if (id) {
			return channels.find((c) => c.id === id) ?? defaultChannel() ?? null;
		}
		return defaultChannel() ?? null;
	});

	return (
		<Layout>
			<SEO
				title={packageName()}
				description={
					pkg()?.description ||
					`View details, dependencies, and versions for ${packageName()} on ${registry()}.`
				}
			/>
			<Container size="lg">
				<Stack spacing="lg" class="py-8">
					<QueryBoundary
						data={pkg()}
						isLoading={isLoading()}
						hasData={!!pkg()}
						loadingFallback={<PackageDetailSkeleton />}
						emptyFallback={
							<Card padding="lg">
								<Stack spacing="md" align="center">
									<Text weight="semibold">Package not found</Text>
									<Text color="muted" size="sm">
										"{packageName()}" on {registry()} is not in our database
										yet.
									</Text>
									<A
										href="/"
										class="text-sm text-primary dark:text-primary-dark hover:underline"
									>
										Search for packages
									</A>
								</Stack>
							</Card>
						}
					>
						{(p) => (
							<>
								{/* Package header */}
								<Header pkg={p} />

								{/* Tabbed content card */}
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
												Overview
											</Tabs.Trigger>
											<Tabs.Trigger value="details" variant="contained">
												Details
											</Tabs.Trigger>
											<Tabs.Trigger value="discussion" variant="contained">
												Discussion
											</Tabs.Trigger>
										</Tabs.List>
									</Tabs.Root>

									{/* Tab content */}
									<div class="p-4">
										<Stack spacing="lg">
											<Switch>
												<Match when={tab() === "overview"}>
													<Show when={sortedChannels().length > 0}>
														<ChannelSelector
															channels={sortedChannels()}
															selectedChannel={selectedChannel()}
															onChannelChange={setSelectedChannelId}
														/>
													</Show>
													<Show when={selectedChannel()}>
														{(channel) => (
															<Dependencies
																channelId={channel().id}
																registry={p.registry}
															/>
														)}
													</Show>
												</Match>

												<Match when={tab() === "details"}>
													<DetailsTab
														packageId={p.id}
														registry={p.registry}
														channels={sortedChannels()}
														selectedChannel={selectedChannel()}
														onChannelChange={setSelectedChannelId}
													/>
												</Match>

												<Match when={tab() === "discussion"}>
													<DiscussionTab packageId={p.id} />
												</Match>
											</Switch>
										</Stack>
									</div>
								</Card>
							</>
						)}
					</QueryBoundary>
				</Stack>
			</Container>
		</Layout>
	);
};

export default Package;

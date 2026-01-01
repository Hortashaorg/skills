import {
	queries,
	type Row,
	useConnectionState,
	useQuery,
} from "@package/database/client";
import { A, useParams } from "@solidjs/router";
import { createMemo, createSignal, Show } from "solid-js";
import { QueryBoundary } from "@/components/composite/query-boundary";
import { Container } from "@/components/primitives/container";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
import { Layout } from "@/layout/Layout";
import type { Registry } from "@/lib/registries";
import { ChannelSelector } from "./sections/ChannelSelector";
import { Dependencies } from "./sections/Dependencies";
import { FetchHistory } from "./sections/FetchHistory";
import { Header } from "./sections/Header";
import { PackageTags } from "./sections/PackageTags";

type ReleaseChannel = Row["packageReleaseChannels"];

export const Package = () => {
	const params = useParams<{ registry: string; name: string }>();

	// Decode URL params
	const registry = () => decodeURIComponent(params.registry) as Registry;
	const packageName = () => decodeURIComponent(params.name);

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
			<Container size="md">
				<Stack spacing="lg" class="py-8">
					<QueryBoundary
						data={pkg()}
						isLoading={isLoading()}
						hasData={!!pkg()}
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

								{/* Tags */}
								<PackageTags packageId={p.id} />

								{/* Channel selector */}
								<Show when={sortedChannels().length > 0}>
									<ChannelSelector
										channels={sortedChannels()}
										selectedChannel={selectedChannel()}
										onChannelChange={setSelectedChannelId}
									/>
								</Show>

								{/* Dependencies */}
								<Show when={selectedChannel()}>
									{(channel) => (
										<Dependencies
											channelId={channel().id}
											registry={p.registry}
										/>
									)}
								</Show>

								{/* Fetch History */}
								<FetchHistory packageId={p.id} />
							</>
						)}
					</QueryBoundary>
				</Stack>
			</Container>
		</Layout>
	);
};

import { queries, type Row, useQuery } from "@package/database/client";
import { createMemo, For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Collapsible } from "@/components/ui/collapsible";
import type { Registry } from "@/lib/registries";
import { buildPackageUrl } from "@/lib/url";

type ReleaseChannel = Row["packageReleaseChannels"];

interface DetailsTabProps {
	packageId: string;
	registry: Registry;
	channels: readonly ReleaseChannel[];
	selectedChannel: ReleaseChannel | null;
	onChannelChange: (channelId: string) => void;
}

interface DependenciesSectionProps {
	channelId: string;
	registry: Registry;
}

const DependenciesSection = (props: DependenciesSectionProps) => {
	const [dependencies] = useQuery(() =>
		queries.channelDependencies.byChannelId({ channelId: props.channelId }),
	);

	const groupedDeps = createMemo(() => {
		const deps = dependencies() ?? [];
		return {
			runtime: deps.filter((d) => d.dependencyType === "runtime"),
			dev: deps.filter((d) => d.dependencyType === "dev"),
			peer: deps.filter((d) => d.dependencyType === "peer"),
			optional: deps.filter((d) => d.dependencyType === "optional"),
		};
	});

	const totalDeps = createMemo(() => {
		const g = groupedDeps();
		return g.runtime.length + g.dev.length + g.peer.length + g.optional.length;
	});

	return (
		<Collapsible.Root defaultOpen>
			<Collapsible.Trigger size="compact">
				Dependencies ({totalDeps()})
			</Collapsible.Trigger>
			<Collapsible.Content size="compact">
				<Show
					when={totalDeps() > 0}
					fallback={
						<Text size="xs" color="muted">
							No dependencies
						</Text>
					}
				>
					<div class="space-y-2">
						<Show when={groupedDeps().runtime.length > 0}>
							<div>
								<Text size="xs" color="muted" class="mb-0.5">
									Runtime ({groupedDeps().runtime.length})
								</Text>
								<div class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
									<For each={groupedDeps().runtime}>
										{(dep) => (
											<a
												href={buildPackageUrl(
													props.registry,
													dep.dependencyPackage?.name ?? "",
												)}
												class="truncate hover:text-primary dark:hover:text-primary-dark"
											>
												{dep.dependencyPackage?.name ?? "Unknown"}
											</a>
										)}
									</For>
								</div>
							</div>
						</Show>

						<Show when={groupedDeps().dev.length > 0}>
							<div>
								<Text size="xs" color="muted" class="mb-0.5">
									Dev ({groupedDeps().dev.length})
								</Text>
								<div class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
									<For each={groupedDeps().dev}>
										{(dep) => (
											<a
												href={buildPackageUrl(
													props.registry,
													dep.dependencyPackage?.name ?? "",
												)}
												class="truncate hover:text-primary dark:hover:text-primary-dark"
											>
												{dep.dependencyPackage?.name ?? "Unknown"}
											</a>
										)}
									</For>
								</div>
							</div>
						</Show>

						<Show when={groupedDeps().peer.length > 0}>
							<div>
								<Text size="xs" color="muted" class="mb-0.5">
									Peer ({groupedDeps().peer.length})
								</Text>
								<div class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
									<For each={groupedDeps().peer}>
										{(dep) => (
											<a
												href={buildPackageUrl(
													props.registry,
													dep.dependencyPackage?.name ?? "",
												)}
												class="truncate hover:text-primary dark:hover:text-primary-dark"
											>
												{dep.dependencyPackage?.name ?? "Unknown"}
											</a>
										)}
									</For>
								</div>
							</div>
						</Show>

						<Show when={groupedDeps().optional.length > 0}>
							<div>
								<Text size="xs" color="muted" class="mb-0.5">
									Optional ({groupedDeps().optional.length})
								</Text>
								<div class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
									<For each={groupedDeps().optional}>
										{(dep) => (
											<a
												href={buildPackageUrl(
													props.registry,
													dep.dependencyPackage?.name ?? "",
												)}
												class="truncate hover:text-primary dark:hover:text-primary-dark"
											>
												{dep.dependencyPackage?.name ?? "Unknown"}
											</a>
										)}
									</For>
								</div>
							</div>
						</Show>
					</div>
				</Show>
			</Collapsible.Content>
		</Collapsible.Root>
	);
};

export const DetailsTab = (props: DetailsTabProps) => {
	const [packageWithTags] = useQuery(() =>
		queries.packages.byIdWithTags({ id: props.packageId }),
	);

	const [allTags] = useQuery(() => queries.tags.list());

	const tagsById = createMemo(() => {
		const all = allTags() ?? [];
		return new Map(all.map((t) => [t.id, t]));
	});

	const packageTags = createMemo(() => packageWithTags()?.packageTags ?? []);

	const [fetchHistory] = useQuery(() =>
		queries.packageFetches.byPackageId({ packageId: props.packageId }),
	);

	return (
		<Stack spacing="md">
			{/* Tags section */}
			<Collapsible.Root defaultOpen>
				<Collapsible.Trigger size="compact">
					Tags ({packageTags().length})
				</Collapsible.Trigger>
				<Collapsible.Content size="compact">
					<Show
						when={packageTags().length > 0}
						fallback={
							<Text size="xs" color="muted">
								No tags
							</Text>
						}
					>
						<Flex wrap="wrap" gap="xs">
							<For each={packageTags()}>
								{(pt) => (
									<Badge variant="secondary">
										{tagsById().get(pt.tagId)?.name ?? "Unknown"}
									</Badge>
								)}
							</For>
						</Flex>
					</Show>
				</Collapsible.Content>
			</Collapsible.Root>

			{/* Channels section */}
			<Collapsible.Root defaultOpen>
				<Collapsible.Trigger size="compact">
					Channels ({props.channels.length})
				</Collapsible.Trigger>
				<Collapsible.Content size="compact">
					<div class="space-y-1">
						<For each={props.channels}>
							{(channel) => (
								<button
									type="button"
									onClick={() => props.onChannelChange(channel.id)}
									class={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
										props.selectedChannel?.id === channel.id
											? "bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark"
											: "hover:bg-surface-alt dark:hover:bg-surface-dark-alt"
									}`}
								>
									<Flex justify="between" align="center">
										<span class="font-medium">{channel.channel}</span>
										<span class="text-xs opacity-75">{channel.version}</span>
									</Flex>
								</button>
							)}
						</For>
					</div>
				</Collapsible.Content>
			</Collapsible.Root>

			{/* Dependencies section */}
			<Show when={props.selectedChannel}>
				{(channel) => (
					<DependenciesSection
						channelId={channel().id}
						registry={props.registry}
					/>
				)}
			</Show>

			{/* Fetch History section */}
			<Collapsible.Root>
				<Collapsible.Trigger size="compact">
					Fetch History ({fetchHistory()?.length ?? 0})
				</Collapsible.Trigger>
				<Collapsible.Content size="compact">
					<Show
						when={fetchHistory()?.length}
						fallback={
							<Text size="xs" color="muted">
								No fetch history
							</Text>
						}
					>
						<div class="space-y-2">
							<For each={fetchHistory()?.slice(0, 5)}>
								{(fetch) => (
									<div class="py-1">
										<Flex justify="between" align="center" class="text-xs">
											<span>
												{new Date(fetch.createdAt).toLocaleDateString()}
											</span>
											<Badge
												variant={
													fetch.status === "completed"
														? "success"
														: fetch.status === "failed"
															? "danger"
															: "warning"
												}
											>
												{fetch.status}
											</Badge>
										</Flex>
										<Show when={fetch.errorMessage}>
											<Text
												size="xs"
												color="danger"
												class="mt-1 line-clamp-2 break-all"
											>
												{fetch.errorMessage}
											</Text>
										</Show>
									</div>
								)}
							</For>
						</div>
					</Show>
				</Collapsible.Content>
			</Collapsible.Root>
		</Stack>
	);
};

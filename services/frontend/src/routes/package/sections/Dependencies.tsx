import {
	queries,
	type Row,
	useConnectionState,
	useQuery,
} from "@package/database/client";
import { For, Show } from "solid-js";
import { QueryBoundary } from "@/components/composite/query-boundary";
import { PackageCard } from "@/components/feature/package-card";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Tabs } from "@/components/ui/tabs";
import { createPackageUpvote } from "@/hooks/packages";
import type { DependencyType, Registry } from "@/lib/registries";
import { buildPackageUrl } from "@/lib/url";

type ChannelDependency = Row["channelDependencies"] & {
	dependencyPackage: Row["packages"] & {
		upvotes?: readonly Row["packageUpvotes"][];
		packageTags?: readonly (Row["packageTags"] & {
			tag: Row["tags"];
		})[];
	};
};

export interface DependenciesProps {
	channelId: string;
	registry: Registry;
}

const DependencyCard = (props: {
	dep: ChannelDependency;
	registry: Registry;
}) => {
	const pkg = () => props.dep.dependencyPackage;
	const upvote = createPackageUpvote(pkg);

	const tags = () =>
		pkg().packageTags?.map((pt) => ({
			name: pt.tag.name,
			slug: pt.tag.slug,
		})) ?? [];

	const status = () => {
		const s = pkg().status;
		if (s === "failed" || s === "placeholder") return s;
		return undefined;
	};

	return (
		<PackageCard
			name={pkg().name}
			registry={pkg().registry}
			description={pkg().description}
			href={buildPackageUrl(pkg().registry, pkg().name)}
			upvoteCount={upvote.upvoteCount()}
			isUpvoted={upvote.isUpvoted()}
			upvoteDisabled={upvote.isDisabled()}
			onUpvote={upvote.toggle}
			tags={tags()}
			status={status()}
			failureReason={pkg().failureReason}
			versionRange={props.dep.dependencyVersionRange}
		/>
	);
};

export const Dependencies = (props: DependenciesProps) => {
	const [dependencies] = useQuery(() =>
		queries.channelDependencies.byChannelId({
			channelId: props.channelId,
		}),
	);
	const connectionState = useConnectionState();

	const isLoading = () =>
		dependencies() === undefined || connectionState().name === "connecting";

	return (
		<Stack spacing="md">
			<Heading level="h3">Dependencies</Heading>

			<QueryBoundary
				data={dependencies()}
				isLoading={isLoading()}
				emptyFallback={
					<Text color="muted" size="sm">
						No dependencies for this channel.
					</Text>
				}
			>
				{(deps) => {
					const byType: Record<DependencyType, ChannelDependency[]> = {
						runtime: [],
						dev: [],
						peer: [],
						optional: [],
					};
					for (const dep of deps as ChannelDependency[]) {
						byType[dep.dependencyType].push(dep);
					}

					const counts = {
						runtime: byType.runtime.length,
						dev: byType.dev.length,
						peer: byType.peer.length,
						optional: byType.optional.length,
					};

					const hasAny =
						counts.runtime > 0 ||
						counts.dev > 0 ||
						counts.peer > 0 ||
						counts.optional > 0;

					if (!hasAny) {
						return (
							<Text color="muted" size="sm">
								No dependencies for this channel.
							</Text>
						);
					}

					// Find first non-empty tab for default
					const defaultTab =
						counts.runtime > 0
							? "runtime"
							: counts.dev > 0
								? "dev"
								: counts.peer > 0
									? "peer"
									: "optional";

					return (
						<Tabs.Root defaultValue={defaultTab}>
							<Tabs.List variant="pills">
								<Show when={counts.runtime > 0}>
									<Tabs.Trigger value="runtime" variant="pills" size="sm">
										Run ({counts.runtime})
									</Tabs.Trigger>
								</Show>
								<Show when={counts.dev > 0}>
									<Tabs.Trigger value="dev" variant="pills" size="sm">
										Dev ({counts.dev})
									</Tabs.Trigger>
								</Show>
								<Show when={counts.peer > 0}>
									<Tabs.Trigger value="peer" variant="pills" size="sm">
										Peer ({counts.peer})
									</Tabs.Trigger>
								</Show>
								<Show when={counts.optional > 0}>
									<Tabs.Trigger value="optional" variant="pills" size="sm">
										Opt ({counts.optional})
									</Tabs.Trigger>
								</Show>
							</Tabs.List>

							<For each={["runtime", "dev", "peer", "optional"] as const}>
								{(depType) => (
									<Tabs.Content value={depType}>
										<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
											<For each={byType[depType]}>
												{(dep) => (
													<DependencyCard dep={dep} registry={props.registry} />
												)}
											</For>
										</div>
									</Tabs.Content>
								)}
							</For>
						</Tabs.Root>
					);
				}}
			</QueryBoundary>
		</Stack>
	);
};

import {
	queries,
	type Row,
	useConnectionState,
	useQuery,
} from "@package/database/client";
import { For, Show } from "solid-js";
import { QueryBoundary } from "@/components/composite/query-boundary";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import type { DependencyType, Registry } from "@/lib/registries";
import { DependencyItem } from "../components/DependencyItem";

type PackageDependency = Row["packageDependencies"];

export interface DependenciesProps {
	versionId: string;
	registry: Registry;
}

export const Dependencies = (props: DependenciesProps) => {
	const [dependencies] = useQuery(() =>
		queries.packageDependencies.byVersionId({
			versionId: props.versionId,
		}),
	);
	const connectionState = useConnectionState();

	const isLoading = () =>
		dependencies() === undefined || connectionState().name === "connecting";

	return (
		<Card padding="lg">
			<Stack spacing="md">
				<Heading level="h2">Dependencies</Heading>

				<QueryBoundary
					data={dependencies()}
					isLoading={isLoading()}
					emptyFallback={
						<Text color="muted" size="sm">
							No dependencies for this version.
						</Text>
					}
				>
					{(deps) => {
						const byType: Record<DependencyType, PackageDependency[]> = {
							runtime: [],
							dev: [],
							peer: [],
							optional: [],
						};
						for (const dep of deps) {
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
									No dependencies for this version.
								</Text>
							);
						}

						return (
							<Tabs.Root defaultValue="runtime">
								<Tabs.List variant="line">
									<Show when={counts.runtime > 0}>
										<Tabs.Trigger value="runtime" variant="line">
											Runtime ({counts.runtime})
										</Tabs.Trigger>
									</Show>
									<Show when={counts.dev > 0}>
										<Tabs.Trigger value="dev" variant="line">
											Dev ({counts.dev})
										</Tabs.Trigger>
									</Show>
									<Show when={counts.peer > 0}>
										<Tabs.Trigger value="peer" variant="line">
											Peer ({counts.peer})
										</Tabs.Trigger>
									</Show>
									<Show when={counts.optional > 0}>
										<Tabs.Trigger value="optional" variant="line">
											Optional ({counts.optional})
										</Tabs.Trigger>
									</Show>
								</Tabs.List>

								<For each={["runtime", "dev", "peer", "optional"] as const}>
									{(depType) => (
										<Tabs.Content value={depType}>
											<Stack spacing="sm" class="mt-4">
												<For each={byType[depType]}>
													{(dep) => (
														<DependencyItem
															dep={dep}
															registry={props.registry}
														/>
													)}
												</For>
											</Stack>
										</Tabs.Content>
									)}
								</For>
							</Tabs.Root>
						);
					}}
				</QueryBoundary>
			</Stack>
		</Card>
	);
};

import { queries, type Row, useQuery } from "@package/database/client";
import { createMemo, For, Show } from "solid-js";
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
	// Query dependencies for selected version
	const [dependencies] = useQuery(() =>
		queries.packageDependencies.byVersionId({
			versionId: props.versionId,
		}),
	);

	// Group dependencies by type
	const dependenciesByType = createMemo(() => {
		const deps = dependencies() ?? [];
		const grouped: Record<DependencyType, PackageDependency[]> = {
			runtime: [],
			dev: [],
			peer: [],
			optional: [],
		};
		for (const dep of deps) {
			grouped[dep.dependencyType].push(dep);
		}
		return grouped;
	});

	// Count dependencies by type
	const depCounts = createMemo(() => {
		const byType = dependenciesByType();
		return {
			runtime: byType.runtime.length,
			dev: byType.dev.length,
			peer: byType.peer.length,
			optional: byType.optional.length,
		};
	});

	const hasDependencies = createMemo(() => {
		const counts = depCounts();
		return (
			counts.runtime > 0 ||
			counts.dev > 0 ||
			counts.peer > 0 ||
			counts.optional > 0
		);
	});

	return (
		<Card padding="lg">
			<Stack spacing="md">
				<Heading level="h2">Dependencies</Heading>

				<Show
					when={hasDependencies()}
					fallback={
						<Text color="muted" size="sm">
							No dependencies for this version.
						</Text>
					}
				>
					<Tabs.Root defaultValue="runtime">
						<Tabs.List variant="line">
							<Show when={depCounts().runtime > 0}>
								<Tabs.Trigger value="runtime" variant="line">
									Runtime ({depCounts().runtime})
								</Tabs.Trigger>
							</Show>
							<Show when={depCounts().dev > 0}>
								<Tabs.Trigger value="dev" variant="line">
									Dev ({depCounts().dev})
								</Tabs.Trigger>
							</Show>
							<Show when={depCounts().peer > 0}>
								<Tabs.Trigger value="peer" variant="line">
									Peer ({depCounts().peer})
								</Tabs.Trigger>
							</Show>
							<Show when={depCounts().optional > 0}>
								<Tabs.Trigger value="optional" variant="line">
									Optional ({depCounts().optional})
								</Tabs.Trigger>
							</Show>
						</Tabs.List>

						<For each={["runtime", "dev", "peer", "optional"] as const}>
							{(depType) => (
								<Tabs.Content value={depType}>
									<Stack spacing="sm" class="mt-4">
										<For each={dependenciesByType()[depType]}>
											{(dep) => (
												<DependencyItem dep={dep} registry={props.registry} />
											)}
										</For>
									</Stack>
								</Tabs.Content>
							)}
						</For>
					</Tabs.Root>
				</Show>
			</Stack>
		</Card>
	);
};

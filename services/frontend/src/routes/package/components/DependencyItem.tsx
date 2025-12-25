import type { Row } from "@package/database/client";
import { A } from "@solidjs/router";
import { Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import type { Registry } from "@/lib/registries";
import { buildPackageUrl } from "@/lib/url";

type PackageDependency = Row["packageDependencies"];

export interface DependencyItemProps {
	dep: PackageDependency;
	registry: Registry;
}

export const DependencyItem = (props: DependencyItemProps) => {
	return (
		<Flex
			justify="between"
			align="center"
			class="py-2 border-b border-outline/50 dark:border-outline-dark/50 last:border-b-0"
		>
			<Flex gap="sm" align="center">
				<Show
					when={props.dep.dependencyPackageId}
					fallback={
						<Text size="sm" class="text-on-surface dark:text-on-surface-dark">
							{props.dep.dependencyName}
						</Text>
					}
				>
					<A
						href={buildPackageUrl(
							props.registry,
							props.dep.dependencyName,
							props.dep.dependencyVersionRange,
						)}
						class="text-sm text-primary dark:text-primary-dark hover:underline"
					>
						{props.dep.dependencyName}
					</A>
				</Show>
				<Show when={!props.dep.dependencyPackageId}>
					<Badge variant="secondary" size="sm">
						not fetched
					</Badge>
				</Show>
			</Flex>
			<Text size="xs" color="muted">
				{props.dep.dependencyVersionRange}
			</Text>
		</Flex>
	);
};

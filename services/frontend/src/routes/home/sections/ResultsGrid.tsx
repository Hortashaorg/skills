import type { Row } from "@package/database/client";
import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type Package = Row["packages"];

export interface ResultsGridProps {
	packages: Package[];
	maxResults: number;
}

export const ResultsGrid = (props: ResultsGridProps) => {
	return (
		<Show when={props.packages.length > 0}>
			<Stack spacing="sm">
				<Text size="sm" color="muted">
					{props.packages.length} result
					{props.packages.length !== 1 ? "s" : ""}
					{props.packages.length === props.maxResults ? " (max)" : ""}
				</Text>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<For each={props.packages}>
						{(pkg) => (
							<A
								href={`/package/${encodeURIComponent(pkg.registry)}/${encodeURIComponent(pkg.name)}`}
								class="block"
							>
								<Card
									padding="md"
									class="h-full hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition-colors cursor-pointer"
								>
									<Stack spacing="xs">
										<Flex gap="sm" align="center">
											<Text
												weight="semibold"
												class="text-on-surface dark:text-on-surface-dark truncate"
											>
												{pkg.name}
											</Text>
											<Badge variant="secondary" size="sm">
												{pkg.registry}
											</Badge>
										</Flex>
										<Show when={pkg.description}>
											<Text size="sm" color="muted" class="line-clamp-2">
												{pkg.description}
											</Text>
										</Show>
									</Stack>
								</Card>
							</A>
						)}
					</For>
				</div>
			</Stack>
		</Show>
	);
};

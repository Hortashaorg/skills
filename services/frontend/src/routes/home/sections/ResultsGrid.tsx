import type { Row } from "@package/database/client";
import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UpvoteButton } from "@/components/ui/upvote-button";
import { createPackageUpvote } from "@/hooks/createPackageUpvote";
import { buildPackageUrl } from "@/lib/url";

type Package = Row["packages"] & {
	upvotes?: readonly Row["packageUpvotes"][];
};

export interface ResultsGridProps {
	packages: readonly Package[];
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
						{(pkg) => {
							const upvote = createPackageUpvote(() => pkg);

							return (
								<Card
									padding="md"
									class="h-full hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition-colors"
								>
									<Stack spacing="xs">
										<Flex gap="sm" align="center" justify="between">
											<A
												href={buildPackageUrl(pkg.registry, pkg.name)}
												class="flex items-center gap-2 min-w-0 flex-1"
											>
												<Text
													weight="semibold"
													class="text-on-surface dark:text-on-surface-dark truncate"
												>
													{pkg.name}
												</Text>
												<Badge variant="secondary" size="sm">
													{pkg.registry}
												</Badge>
											</A>
											<UpvoteButton
												count={upvote.upvoteCount()}
												isUpvoted={upvote.isUpvoted()}
												disabled={upvote.isDisabled()}
												onClick={upvote.toggle}
											/>
										</Flex>
										<Show when={pkg.description}>
											<A href={buildPackageUrl(pkg.registry, pkg.name)}>
												<Text size="sm" color="muted" class="line-clamp-2">
													{pkg.description}
												</Text>
											</A>
										</Show>
									</Stack>
								</Card>
							);
						}}
					</For>
				</div>
			</Stack>
		</Show>
	);
};

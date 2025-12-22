import type { Row } from "@package/database/client";
import { mutators, useZero } from "@package/database/client";
import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UpvoteButton } from "@/components/ui/upvote-button";

type Package = Row["packages"] & {
	upvotes?: readonly Row["packageUpvotes"][];
};

export interface RecentPackagesProps {
	packages: readonly Package[];
}

export const RecentPackages = (props: RecentPackagesProps) => {
	const zero = useZero();

	const handleUpvoteClick = async (pkg: Package) => {
		const userId = zero().userID;
		if (userId === "anon") return;

		const existingUpvote = pkg.upvotes?.find((u) => u.accountId === userId);

		if (existingUpvote) {
			zero().mutate(mutators.packageUpvotes.remove({ id: existingUpvote.id }));
		} else {
			zero().mutate(mutators.packageUpvotes.create({ packageId: pkg.id }));
		}
	};

	return (
		<Stack spacing="sm">
			<Text size="sm" color="muted">
				Recently updated
			</Text>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<For each={props.packages}>
					{(pkg) => {
						const userId = zero().userID;
						const isUpvoted = () =>
							pkg.upvotes?.some((u) => u.accountId === userId) ?? false;
						const upvoteCount = () => pkg.upvotes?.length ?? 0;

						return (
							<Card
								padding="md"
								class="h-full hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition-colors"
							>
								<Stack spacing="xs">
									<Flex gap="sm" align="center" justify="between">
										<A
											href={`/package/${encodeURIComponent(pkg.registry)}/${encodeURIComponent(pkg.name)}`}
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
											count={upvoteCount()}
											isUpvoted={isUpvoted()}
											disabled={userId === "anon"}
											onClick={() => handleUpvoteClick(pkg)}
										/>
									</Flex>
									<Show when={pkg.description}>
										<A
											href={`/package/${encodeURIComponent(pkg.registry)}/${encodeURIComponent(pkg.name)}`}
										>
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
	);
};

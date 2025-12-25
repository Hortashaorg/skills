import type { Row } from "@package/database/client";
import { For } from "solid-js";
import { PackageCard } from "@/components/feature/package-card";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { createPackageUpvote } from "@/hooks/createPackageUpvote";
import { buildPackageUrl } from "@/lib/url";

type Package = Row["packages"] & {
	upvotes?: readonly Row["packageUpvotes"][];
};

export interface RecentPackagesProps {
	packages: readonly Package[];
}

export const RecentPackages = (props: RecentPackagesProps) => {
	return (
		<Stack spacing="sm">
			<Text size="sm" color="muted">
				Recently updated
			</Text>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<For each={props.packages}>
					{(pkg) => {
						const upvote = createPackageUpvote(() => pkg);

						return (
							<PackageCard
								name={pkg.name}
								registry={pkg.registry}
								description={pkg.description}
								href={buildPackageUrl(pkg.registry, pkg.name)}
								upvoteCount={upvote.upvoteCount()}
								isUpvoted={upvote.isUpvoted()}
								upvoteDisabled={upvote.isDisabled()}
								onUpvote={upvote.toggle}
							/>
						);
					}}
				</For>
			</div>
		</Stack>
	);
};

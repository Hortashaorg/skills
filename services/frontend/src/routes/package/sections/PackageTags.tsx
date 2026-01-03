import { queries, useQuery } from "@package/database/client";
import { createMemo, For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Badge } from "@/components/ui/badge";

type Props = {
	packageId: string;
};

export const PackageTags = (props: Props) => {
	const [packageWithTags] = useQuery(() =>
		queries.packages.byIdWithTags({ id: props.packageId }),
	);

	const [allTags] = useQuery(() => queries.tags.list());

	const packageTags = createMemo(() => packageWithTags()?.packageTags ?? []);

	const tagsById = createMemo(() => {
		const all = allTags() ?? [];
		return new Map(all.map((t) => [t.id, t]));
	});

	return (
		<Show when={packageTags().length > 0}>
			<Flex align="center" wrap="wrap" gap="sm">
				<For each={packageTags()}>
					{(pt) => (
						<Badge variant="secondary">
							{tagsById().get(pt.tagId)?.name ?? "Unknown"}
						</Badge>
					)}
				</For>
			</Flex>
		</Show>
	);
};

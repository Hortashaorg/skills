import type { Row } from "@package/database/client";
import { queries, useQuery } from "@package/database/client";
import { type Accessor, createMemo } from "solid-js";

export type Ecosystem = Row["ecosystems"] & {
	upvotes?: readonly Row["ecosystemUpvotes"][];
	ecosystemTags?: readonly (Row["ecosystemTags"] & {
		tag?: Row["tags"];
	})[];
};

export interface UseEcosystemByIdsResult {
	ecosystems: Accessor<Map<string, Ecosystem>>;
	isLoading: Accessor<boolean>;
}

/**
 * Hook for fetching ecosystems by IDs.
 *
 * Returns a Map for O(1) lookup by ID.
 * Supports both single and batch lookups.
 *
 * @example Single lookup
 * ```tsx
 * const { ecosystems, isLoading } = useEcosystemByIds(() => [ecosystemId]);
 * const eco = () => ecosystems().get(ecosystemId);
 * ```
 *
 * @example Batch lookup
 * ```tsx
 * const { ecosystems, isLoading } = useEcosystemByIds(() => [id1, id2, id3]);
 *
 * <For each={ids}>
 *   {id => <EcosystemCard ecosystem={ecosystems().get(id)} />}
 * </For>
 * ```
 */
export function useEcosystemByIds(
	ids: Accessor<readonly string[]>,
): UseEcosystemByIdsResult {
	const [data, result] = useQuery(() => {
		const idList = ids();
		if (idList.length === 0) return null;
		return queries.ecosystems.byIds({ ids: [...idList] });
	});

	const ecosystems = createMemo(() => {
		const map = new Map<string, Ecosystem>();
		for (const eco of data() ?? []) {
			map.set(eco.id, eco);
		}
		return map;
	});

	const isLoading = () => {
		if (ids().length === 0) return false;
		return result().type !== "complete";
	};

	return {
		ecosystems,
		isLoading,
	};
}

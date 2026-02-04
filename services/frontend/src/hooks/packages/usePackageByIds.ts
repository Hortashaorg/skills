import type { Row } from "@package/database/client";
import { queries, useQuery } from "@package/database/client";
import { type Accessor, createMemo } from "solid-js";

export type Package = Row["packages"] & {
	packageTags?: readonly (Row["packageTags"] & {
		tag?: Row["tags"];
	})[];
};

export interface UsePackageByIdsResult {
	packages: Accessor<Map<string, Package>>;
	isLoading: Accessor<boolean>;
}

/**
 * Hook for fetching packages by IDs.
 *
 * Returns a Map for O(1) lookup by ID.
 * Supports both single and batch lookups.
 *
 * @example Single lookup
 * ```tsx
 * const { packages, isLoading } = usePackageByIds(() => [packageId]);
 * const pkg = () => packages().get(packageId);
 * ```
 *
 * @example Batch lookup
 * ```tsx
 * const { packages, isLoading } = usePackageByIds(() => [id1, id2, id3]);
 *
 * <For each={ids}>
 *   {id => <PackageCard package={packages().get(id)} />}
 * </For>
 * ```
 */
export function usePackageByIds(
	ids: Accessor<readonly string[]>,
): UsePackageByIdsResult {
	const [data, result] = useQuery(() => {
		const idList = ids();
		if (idList.length === 0) return null;
		return queries.packages.byIds({ ids: [...idList] });
	});

	const packages = createMemo(() => {
		const map = new Map<string, Package>();
		for (const pkg of data() ?? []) {
			map.set(pkg.id, pkg);
		}
		return map;
	});

	const isLoading = () => {
		if (ids().length === 0) return false;
		return result().type !== "complete";
	};

	return {
		packages,
		isLoading,
	};
}

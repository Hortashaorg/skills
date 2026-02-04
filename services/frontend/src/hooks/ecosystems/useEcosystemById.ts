import type { Row } from "@package/database/client";
import { queries, useQuery } from "@package/database/client";
import type { Accessor } from "solid-js";

type EcosystemTag = Row["ecosystemTags"] & {
	tag?: Row["tags"];
};

type EcosystemPackage = Row["ecosystemPackages"] & {
	package?: Row["packages"] & {
		packageTags?: readonly (Row["packageTags"] & { tag?: Row["tags"] })[];
		upvotes?: readonly Row["packageUpvotes"][];
	};
};

export type EcosystemWithRelations = Row["ecosystems"] & {
	upvotes?: readonly Row["ecosystemUpvotes"][];
	ecosystemPackages?: readonly EcosystemPackage[];
	ecosystemTags?: readonly EcosystemTag[];
};

export interface UseEcosystemByIdResult {
	ecosystem: Accessor<EcosystemWithRelations | null>;
	isLoading: Accessor<boolean>;
}

/**
 * Hook for fetching a single ecosystem by ID.
 *
 * Returns the ecosystem data and loading state.
 * Includes related packages and tags.
 *
 * @example
 * ```tsx
 * const { ecosystem, isLoading } = useEcosystemById(() => ecosystemId);
 *
 * <Show when={!isLoading()} fallback={<Spinner />}>
 *   <div>{ecosystem()?.name}</div>
 * </Show>
 * ```
 */
export function useEcosystemById(
	id: Accessor<string | null | undefined>,
): UseEcosystemByIdResult {
	const [data, result] = useQuery(() => {
		const ecosystemId = id();
		if (!ecosystemId) return null;
		return queries.ecosystems.byId({ id: ecosystemId });
	});

	const ecosystem = () => {
		const results = data();
		return results?.[0] ?? null;
	};
	const isLoading = () => result().type !== "complete";

	return {
		ecosystem,
		isLoading,
	};
}

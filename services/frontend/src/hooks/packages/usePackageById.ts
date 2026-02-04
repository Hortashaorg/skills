import type { Row } from "@package/database/client";
import { queries, useQuery } from "@package/database/client";
import type { Accessor } from "solid-js";

export type PackageWithTags = Row["packages"] & {
	packageTags?: readonly (Row["packageTags"] & {
		tag?: Row["tags"];
	})[];
};

export interface UsePackageByIdResult {
	package: Accessor<PackageWithTags | null>;
	isLoading: Accessor<boolean>;
}

/**
 * Hook for fetching a single package by ID.
 *
 * Returns the package data and loading state.
 * Uses `byIdWithTags` query to include tag information.
 *
 * @example
 * ```tsx
 * const { package: pkg, isLoading } = usePackageById(() => packageId);
 *
 * <Show when={!isLoading()} fallback={<Spinner />}>
 *   <div>{pkg()?.name}</div>
 * </Show>
 * ```
 */
export function usePackageById(
	id: Accessor<string | null | undefined>,
): UsePackageByIdResult {
	const [data, result] = useQuery(() => {
		const packageId = id();
		if (!packageId) return null;
		return queries.packages.byIdWithTags({ id: packageId });
	});

	const pkg = () => data() ?? null;
	const isLoading = () => result().type !== "complete";

	return {
		package: pkg,
		isLoading,
	};
}

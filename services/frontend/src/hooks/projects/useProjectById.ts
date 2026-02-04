import type { Row } from "@package/database/client";
import { queries, useQuery } from "@package/database/client";
import type { Accessor } from "solid-js";

type PackageTag = Row["packageTags"] & {
	tag?: Row["tags"];
};

type Package = Row["packages"] & {
	packageTags?: readonly PackageTag[];
	upvotes?: readonly Row["packageUpvotes"][];
};

type ProjectPackage = Row["projectPackages"] & {
	package?: Package;
};

type EcosystemTag = Row["ecosystemTags"] & {
	tag?: Row["tags"];
};

type Ecosystem = Row["ecosystems"] & {
	ecosystemTags?: readonly EcosystemTag[];
	upvotes?: readonly Row["ecosystemUpvotes"][];
};

type ProjectEcosystem = Row["projectEcosystems"] & {
	ecosystem?: Ecosystem;
};

export type Project = Row["projects"] & {
	account?: Row["account"];
	projectPackages?: readonly ProjectPackage[];
	projectEcosystems?: readonly ProjectEcosystem[];
};

export interface UseProjectByIdResult {
	project: Accessor<Project | null>;
	isLoading: Accessor<boolean>;
}

/**
 * Hook to fetch a single project by ID.
 *
 * @example
 * ```tsx
 * const { project, isLoading } = useProjectById(() => params.id);
 *
 * <Show when={!isLoading()} fallback={<Skeleton />}>
 *   <ProjectDetail project={project()!} />
 * </Show>
 * ```
 */
export function useProjectById(
	id: Accessor<string | null | undefined>,
): UseProjectByIdResult {
	const [project, projectResult] = useQuery(() => {
		const projectId = id();
		return projectId ? queries.projects.byId({ id: projectId }) : null;
	});

	const isLoading = () => {
		const projectId = id();
		if (!projectId) return false;
		return projectResult().type !== "complete";
	};

	return {
		project: () => project() ?? null,
		isLoading,
	};
}

import type { Row } from "@package/database/client";
import { queries, useQuery } from "@package/database/client";
import { type Accessor, createMemo } from "solid-js";

export type Project = Row["projects"] & {
	account?: Row["account"];
	projectPackages?: readonly Row["projectPackages"][];
};

export interface UseProjectByIdsResult {
	projects: Accessor<Map<string, Project>>;
	isLoading: Accessor<boolean>;
}

/**
 * Hook for fetching projects by IDs.
 *
 * Returns a Map for O(1) lookup by ID.
 * Supports both single and batch lookups.
 *
 * @example Single lookup
 * ```tsx
 * const { projects, isLoading } = useProjectByIds(() => [projectId]);
 * const project = () => projects().get(projectId);
 * ```
 *
 * @example Batch lookup
 * ```tsx
 * const { projects, isLoading } = useProjectByIds(() => [id1, id2, id3]);
 *
 * <For each={ids}>
 *   {id => <ProjectCard project={projects().get(id)} />}
 * </For>
 * ```
 */
export function useProjectByIds(
	ids: Accessor<readonly string[]>,
): UseProjectByIdsResult {
	const [data, result] = useQuery(() => {
		const idList = ids();
		if (idList.length === 0) return null;
		return queries.projects.byIds({ ids: [...idList] });
	});

	const projects = createMemo(() => {
		const map = new Map<string, Project>();
		for (const project of data() ?? []) {
			map.set(project.id, project);
		}
		return map;
	});

	const isLoading = () => {
		if (ids().length === 0) return false;
		return result().type !== "complete";
	};

	return {
		projects,
		isLoading,
	};
}

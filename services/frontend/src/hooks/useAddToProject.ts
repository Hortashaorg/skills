import { mutators, queries, useQuery, useZero } from "@package/database/client";
import { createSignal } from "solid-js";
import type { Project } from "@/components/composite/add-to-project-popover";
import { toast } from "@/components/ui/toast";
import { handleMutationError } from "@/lib/mutation-error";

export interface UseAddToProjectOptions {
	entityType: "package" | "ecosystem";
	entityId: string;
}

export interface UseAddToProjectResult {
	projects: () => readonly Project[];
	isInProject: (projectId: string) => boolean;
	onAdd: (projectId: string) => void;
	addingToProjectId: () => string | null;
	isLoggedIn: () => boolean;
}

export function useAddToProject(
	options: () => UseAddToProjectOptions,
): UseAddToProjectResult {
	const zero = useZero();
	const [addingToProjectId, setAddingToProjectId] = createSignal<string | null>(
		null,
	);

	const isLoggedIn = () => zero().userID !== "anon";

	const [userProjects] = useQuery(() =>
		isLoggedIn() ? queries.projects.mine({}) : null,
	);

	const projects = (): readonly Project[] => {
		const list = userProjects() ?? [];
		return list.map((p) => ({ id: p.id, name: p.name }));
	};

	const isInProject = (projectId: string): boolean => {
		const { entityType, entityId } = options();
		const project = userProjects()?.find((p) => p.id === projectId);
		if (!project) return false;

		if (entityType === "package") {
			return (
				project.projectPackages?.some((pp) => pp.packageId === entityId) ??
				false
			);
		}
		return (
			project.projectEcosystems?.some((pe) => pe.ecosystemId === entityId) ??
			false
		);
	};

	const onAdd = (projectId: string) => {
		const { entityType, entityId } = options();

		if (isInProject(projectId)) {
			toast.info("Already in this project.", "Already added");
			return;
		}

		setAddingToProjectId(projectId);

		try {
			if (entityType === "package") {
				zero().mutate(
					mutators.projectPackages.add({
						projectId,
						packageId: entityId,
					}),
				);
			} else {
				zero().mutate(
					mutators.projectEcosystems.add({
						projectId,
						ecosystemId: entityId,
					}),
				);
			}
			toast.success("Added to project.", "Success");
		} catch (err) {
			handleMutationError(err, "add to project", { useErrorMessage: true });
		} finally {
			setAddingToProjectId(null);
		}
	};

	return {
		projects,
		isInProject,
		onAdd,
		addingToProjectId,
		isLoggedIn,
	};
}

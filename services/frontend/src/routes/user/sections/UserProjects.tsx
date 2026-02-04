import type { Row } from "@package/database/client";
import { For, Show } from "solid-js";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { ProjectCard } from "@/routes/me/projects/sections/ProjectCard";

type ProjectWithPackages = Row["projects"] & {
	projectPackages?: readonly Row["projectPackages"][];
	account?: Row["account"] | null;
};

interface UserProjectsProps {
	projects: readonly ProjectWithPackages[];
}

export const UserProjects = (props: UserProjectsProps) => {
	return (
		<Stack spacing="sm">
			<Text weight="semibold">Projects</Text>
			<Show
				when={props.projects.length > 0}
				fallback={
					<Text size="sm" color="muted" class="py-4">
						No public projects yet
					</Text>
				}
			>
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<For each={props.projects}>
						{(project) => <ProjectCard project={project} />}
					</For>
				</div>
			</Show>
		</Stack>
	);
};

import type { Row } from "@package/database/client";
import { A } from "@solidjs/router";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";

type ProjectWithPackages = Row["projects"] & {
	projectPackages: readonly Row["projectPackages"][];
};

interface ProjectCardProps {
	project: ProjectWithPackages;
}

export const ProjectCard = (props: ProjectCardProps) => {
	const packageCount = () => props.project.projectPackages?.length ?? 0;

	return (
		<A href={`/projects/${props.project.id}`}>
			<Card
				padding="md"
				class="h-full hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition-colors cursor-pointer"
			>
				<Stack spacing="sm">
					<Text weight="semibold" class="truncate">
						{props.project.name}
					</Text>
					{props.project.description && (
						<Text size="sm" color="muted" class="line-clamp-2">
							{props.project.description}
						</Text>
					)}
					<Flex justify="between" align="center" class="pt-2">
						<Text size="xs" color="muted">
							{packageCount()} package{packageCount() !== 1 ? "s" : ""}
						</Text>
						<Text size="xs" color="muted">
							{new Date(props.project.updatedAt).toLocaleDateString()}
						</Text>
					</Flex>
				</Stack>
			</Card>
		</A>
	);
};

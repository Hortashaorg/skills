import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProjectDetailSkeleton = () => (
	<Stack spacing="lg">
		<Flex justify="between" align="center">
			<Skeleton variant="text" width="200px" height="32px" />
			<Skeleton variant="rectangular" width="80px" height="36px" />
		</Flex>
		<Skeleton variant="text" width="60%" />
		<Card padding="lg">
			<Stack spacing="md">
				<Skeleton variant="text" width="120px" height="24px" />
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<Skeleton variant="rectangular" height="100px" />
					<Skeleton variant="rectangular" height="100px" />
					<Skeleton variant="rectangular" height="100px" />
				</div>
			</Stack>
		</Card>
	</Stack>
);

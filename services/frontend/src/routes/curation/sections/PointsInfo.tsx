import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";

export const PointsInfo = () => {
	return (
		<Card padding="md">
			<Stack spacing="xs">
				<Text size="sm" weight="semibold">
					How points work
				</Text>
				<Text size="xs" color="muted">
					+5 when your suggestion is approved
				</Text>
				<Text size="xs" color="muted">
					-1 when your suggestion is rejected
				</Text>
				<Text size="xs" color="muted">
					+1 when your vote matches the outcome
				</Text>
			</Stack>
		</Card>
	);
};

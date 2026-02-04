import { Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Card } from "@/components/ui/card";

interface ContributionStatsProps {
	monthlyScore: number;
	allTimeScore: number;
	rank: number | null;
}

const StatCard = (props: { label: string; value: string | number }) => (
	<Card padding="md" class="flex-1 text-center">
		<Stack spacing="xs">
			<Text size="xl" weight="bold">
				{props.value}
			</Text>
			<Text size="sm" color="muted">
				{props.label}
			</Text>
		</Stack>
	</Card>
);

export const ContributionStats = (props: ContributionStatsProps) => {
	const rankDisplay = () => {
		if (props.rank === null) return "—";
		return `#${props.rank}`;
	};

	return (
		<Stack spacing="sm">
			<Text weight="semibold">Contributions</Text>
			<Flex gap="md" class="flex-col sm:flex-row">
				<StatCard label="This Month" value={props.monthlyScore} />
				<StatCard label="All Time" value={props.allTimeScore} />
				<Show when={props.allTimeScore > 0}>
					<StatCard label="Rank" value={rankDisplay()} />
				</Show>
			</Flex>
		</Stack>
	);
};

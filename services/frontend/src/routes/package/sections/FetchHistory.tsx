import {
	queries,
	useConnectionState,
	useQuery,
} from "@package/database/client";
import { For } from "solid-js";
import { QueryBoundary } from "@/components/composite/query-boundary";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface FetchHistoryProps {
	packageId: string;
}

const formatDate = (timestamp: number | null) => {
	if (!timestamp) return "-";
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(timestamp));
};

const statusVariant = (status: string) => {
	switch (status) {
		case "completed":
			return "success";
		case "failed":
			return "danger";
		case "pending":
			return "warning";
		default:
			return "secondary";
	}
};

export const FetchHistory = (props: FetchHistoryProps) => {
	const [fetches] = useQuery(() =>
		queries.packageFetches.byPackageId({ packageId: props.packageId }),
	);
	const connectionState = useConnectionState();

	const isLoading = () =>
		fetches() === undefined || connectionState().name === "connecting";

	return (
		<Card padding="lg">
			<Stack spacing="md">
				<Heading level="h2">Fetch History</Heading>

				<QueryBoundary
					data={fetches()}
					isLoading={isLoading()}
					emptyFallback={
						<Text color="muted" size="sm">
							No fetch history available.
						</Text>
					}
				>
					{(fetchList) => (
						<Stack spacing="sm">
							<For each={fetchList.slice(0, 10)}>
								{(fetch) => (
									<Stack
										spacing="xs"
										class="py-3 border-b border-neutral-200 dark:border-neutral-700 last:border-b-0"
									>
										<Flex justify="between" align="center">
											<Flex align="center" gap="md">
												<Badge variant={statusVariant(fetch.status)} size="sm">
													{fetch.status}
												</Badge>
												<Text size="sm" color="muted">
													{formatDate(fetch.createdAt)}
												</Text>
											</Flex>
											{fetch.completedAt && (
												<Text size="sm" color="muted">
													Completed: {formatDate(fetch.completedAt)}
												</Text>
											)}
										</Flex>
										{fetch.errorMessage && (
											<Text size="sm" color="danger">
												{fetch.errorMessage}
											</Text>
										)}
									</Stack>
								)}
							</For>
						</Stack>
					)}
				</QueryBoundary>
			</Stack>
		</Card>
	);
};

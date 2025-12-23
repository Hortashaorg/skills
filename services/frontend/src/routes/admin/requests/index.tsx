import {
	type PackageRequestStatus,
	queries,
	useQuery,
	useZero,
} from "@package/database/client";
import { createSignal, Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Tabs } from "@/components/ui/tabs";
import { getAuthData } from "@/context/app-provider";
import { Layout } from "@/layout/Layout";
import { RequestsTable } from "./sections/RequestsTable";

const STATUSES: { value: PackageRequestStatus | "all"; label: string }[] = [
	{ value: "all", label: "Recent" },
	{ value: "pending", label: "Pending" },
	{ value: "fetching", label: "Fetching" },
	{ value: "completed", label: "Completed" },
	{ value: "failed", label: "Failed" },
	{ value: "discarded", label: "Discarded" },
];

export const AdminRequests = () => {
	const zero = useZero();
	const [activeTab, setActiveTab] = createSignal<string>("all");

	const isAdmin = () => getAuthData()?.roles?.includes("admin") ?? false;
	const isLoggedIn = () => zero().userID !== "anon";

	const [recentRequests] = useQuery(() => queries.packageRequests.recent());
	const [pendingRequests] = useQuery(() =>
		queries.packageRequests.byStatus({ status: "pending" }),
	);
	const [fetchingRequests] = useQuery(() =>
		queries.packageRequests.byStatus({ status: "fetching" }),
	);
	const [completedRequests] = useQuery(() =>
		queries.packageRequests.byStatus({ status: "completed" }),
	);
	const [failedRequests] = useQuery(() =>
		queries.packageRequests.byStatus({ status: "failed" }),
	);
	const [discardedRequests] = useQuery(() =>
		queries.packageRequests.byStatus({ status: "discarded" }),
	);

	const getRequestsForTab = () => {
		switch (activeTab()) {
			case "pending":
				return pendingRequests() ?? [];
			case "fetching":
				return fetchingRequests() ?? [];
			case "completed":
				return completedRequests() ?? [];
			case "failed":
				return failedRequests() ?? [];
			case "discarded":
				return discardedRequests() ?? [];
			default:
				return recentRequests() ?? [];
		}
	};

	return (
		<Layout>
			<Container size="lg">
				<Stack spacing="lg" class="py-8">
					<Show when={!isLoggedIn()}>
						<Text>Please sign in to access this page.</Text>
					</Show>

					<Show when={isLoggedIn() && !isAdmin()}>
						<Text>Unauthorized - admin role required.</Text>
					</Show>

					<Show when={isLoggedIn() && isAdmin()}>
						<Heading level="h1">Package Requests</Heading>

						<Tabs.Root
							defaultValue="all"
							value={activeTab()}
							onChange={setActiveTab}
						>
							<Tabs.List variant="line">
								{STATUSES.map((status) => (
									<Tabs.Trigger value={status.value}>
										{status.label}
									</Tabs.Trigger>
								))}
							</Tabs.List>

							{STATUSES.map((status) => (
								<Tabs.Content value={status.value}>
									<RequestsTable requests={getRequestsForTab()} />
								</Tabs.Content>
							))}
						</Tabs.Root>
					</Show>
				</Stack>
			</Container>
		</Layout>
	);
};

import {
	type PackageRequestStatus,
	queries,
	type Row,
	useQuery,
	useZero,
} from "@package/database/client";
import { createMemo, createSignal, Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Tabs } from "@/components/ui/tabs";
import { getAuthData } from "@/context/app-provider";
import { Layout } from "@/layout/Layout";
import { RequestsTable } from "./sections/RequestsTable";

const DISPLAY_LIMIT = 50;

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
	const [activeTab, setActiveTab] = createSignal<string>("pending");

	const isAdmin = () => getAuthData()?.roles?.includes("admin") ?? false;
	const isLoggedIn = () => zero().userID !== "anon";

	const [allRequests] = useQuery(() => queries.packageRequests.all());

	const counts = createMemo(() => {
		const requests = allRequests() ?? [];
		const result: Record<string, number> = { all: requests.length };
		for (const status of STATUSES) {
			if (status.value !== "all") {
				result[status.value] = requests.filter(
					(r) => r.status === status.value,
				).length;
			}
		}
		return result;
	});

	const getRequestsForTab = createMemo(() => {
		const requests = allRequests() ?? [];
		const tab = activeTab();

		let filtered: readonly Row["packageRequests"][];
		if (tab === "all") {
			filtered = requests;
		} else {
			filtered = requests.filter((r) => r.status === tab);
		}

		const sorted = [...filtered].sort((a, b) => {
			if (tab === "pending" || tab === "fetching") {
				return a.createdAt - b.createdAt;
			}
			return b.updatedAt - a.updatedAt;
		});

		return sorted.slice(0, DISPLAY_LIMIT);
	});

	const getTabLabel = (status: (typeof STATUSES)[number]) => {
		const count = counts()[status.value] ?? 0;
		return `${status.label} (${count})`;
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
							defaultValue="pending"
							value={activeTab()}
							onChange={setActiveTab}
						>
							<Tabs.List variant="line">
								{STATUSES.map((status) => (
									<Tabs.Trigger value={status.value}>
										{getTabLabel(status)}
									</Tabs.Trigger>
								))}
							</Tabs.List>

							{STATUSES.map((status) => (
								<Tabs.Content value={status.value}>
									<RequestsTable
										requests={getRequestsForTab()}
										totalCount={counts()[status.value] ?? 0}
									/>
								</Tabs.Content>
							))}
						</Tabs.Root>
					</Show>
				</Stack>
			</Container>
		</Layout>
	);
};

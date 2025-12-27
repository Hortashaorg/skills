import {
	type PackageRequestStatus,
	queries,
	useConnectionState,
	useQuery,
	useZero,
} from "@package/database/client";
import { createSignal, Show } from "solid-js";
import { AuthGuard } from "@/components/composite/auth-guard";
import { Container } from "@/components/primitives/container";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Spinner } from "@/components/ui/spinner";
import { Tabs } from "@/components/ui/tabs";
import { getAuthData } from "@/context/app-provider";
import { Layout } from "@/layout/Layout";
import { RequestsTable } from "./sections/RequestsTable";

const PAGE_SIZE = 25;

const STATUSES: { value: PackageRequestStatus; label: string }[] = [
	{ value: "pending", label: "Pending" },
	{ value: "fetching", label: "Fetching" },
	{ value: "completed", label: "Completed" },
	{ value: "failed", label: "Failed" },
	{ value: "discarded", label: "Discarded" },
];

export const AdminRequests = () => {
	const zero = useZero();
	const [activeTab, setActiveTab] =
		createSignal<PackageRequestStatus>("pending");
	const [page, setPage] = createSignal(0);

	const isAdmin = () => getAuthData()?.roles?.includes("admin") ?? false;
	const isLoggedIn = () => zero().userID !== "anon";

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
	const connectionState = useConnectionState();

	// Loading state - any query undefined or still connecting
	const isLoading = () =>
		connectionState().name === "connecting" ||
		pendingRequests() === undefined ||
		fetchingRequests() === undefined ||
		completedRequests() === undefined ||
		failedRequests() === undefined ||
		discardedRequests() === undefined;

	const requestsByStatus = () => ({
		pending: pendingRequests() ?? [],
		fetching: fetchingRequests() ?? [],
		completed: completedRequests() ?? [],
		failed: failedRequests() ?? [],
		discarded: discardedRequests() ?? [],
	});

	const counts = () => {
		const byStatus = requestsByStatus();
		return {
			pending: byStatus.pending.length,
			fetching: byStatus.fetching.length,
			completed: byStatus.completed.length,
			failed: byStatus.failed.length,
			discarded: byStatus.discarded.length,
		};
	};

	// Requests are already sorted by the query (pending/fetching by createdAt, others by updatedAt)
	const requestsForTab = () => requestsByStatus()[activeTab()];

	const paginatedRequests = () => {
		const start = page() * PAGE_SIZE;
		return requestsForTab().slice(start, start + PAGE_SIZE);
	};

	const handleTabChange = (value: string) => {
		setActiveTab(value as PackageRequestStatus);
		setPage(0);
	};

	const getTabLabel = (status: (typeof STATUSES)[number]) => {
		const count = counts()[status.value] ?? 0;
		return `${status.label} (${count})`;
	};

	return (
		<Layout>
			<Container size="lg">
				<Stack spacing="lg" class="py-8">
					<AuthGuard hasAccess={isLoggedIn() && isAdmin()}>
						<Heading level="h1">Package Requests</Heading>

						<Show
							when={!isLoading()}
							fallback={
								<div class="flex justify-center py-12">
									<Spinner label="Loading requests..." />
								</div>
							}
						>
							<Tabs.Root
								defaultValue="pending"
								value={activeTab()}
								onChange={handleTabChange}
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
											requests={paginatedRequests()}
											totalCount={counts()[status.value] ?? 0}
											page={page()}
											pageSize={PAGE_SIZE}
											onPageChange={setPage}
										/>
									</Tabs.Content>
								))}
							</Tabs.Root>
						</Show>
					</AuthGuard>
				</Stack>
			</Container>
		</Layout>
	);
};

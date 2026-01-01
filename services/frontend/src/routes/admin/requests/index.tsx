import {
	type FetchStatus,
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
import { FetchesTable } from "./sections/FetchesTable";

const PAGE_SIZE = 25;

const STATUSES: { value: FetchStatus; label: string }[] = [
	{ value: "pending", label: "Pending" },
	{ value: "completed", label: "Completed" },
	{ value: "failed", label: "Failed" },
];

export const AdminRequests = () => {
	const zero = useZero();
	const [activeTab, setActiveTab] = createSignal<FetchStatus>("pending");
	const [page, setPage] = createSignal(0);

	const isAdmin = () => getAuthData()?.roles?.includes("admin") ?? false;
	const isLoggedIn = () => zero().userID !== "anon";

	const [pendingFetches] = useQuery(() =>
		queries.packageFetches.byStatus({ status: "pending" }),
	);
	const [completedFetches] = useQuery(() =>
		queries.packageFetches.byStatus({ status: "completed" }),
	);
	const [failedFetches] = useQuery(() =>
		queries.packageFetches.byStatus({ status: "failed" }),
	);
	const connectionState = useConnectionState();

	const isLoading = () =>
		connectionState().name === "connecting" ||
		pendingFetches() === undefined ||
		completedFetches() === undefined ||
		failedFetches() === undefined;

	const fetchesByStatus = () => ({
		pending: pendingFetches() ?? [],
		completed: completedFetches() ?? [],
		failed: failedFetches() ?? [],
	});

	const counts = () => {
		const byStatus = fetchesByStatus();
		return {
			pending: byStatus.pending.length,
			completed: byStatus.completed.length,
			failed: byStatus.failed.length,
		};
	};

	const fetchesForTab = () => fetchesByStatus()[activeTab()];

	const paginatedFetches = () => {
		const start = page() * PAGE_SIZE;
		return fetchesForTab().slice(start, start + PAGE_SIZE);
	};

	const handleTabChange = (value: string) => {
		setActiveTab(value as FetchStatus);
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
						<Heading level="h1">Package Fetches</Heading>

						<Show
							when={!isLoading()}
							fallback={
								<div class="flex justify-center py-12">
									<Spinner label="Loading fetches..." />
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
										<FetchesTable
											fetches={paginatedFetches()}
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

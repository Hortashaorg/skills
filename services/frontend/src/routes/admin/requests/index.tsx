import {
	queries,
	type Row,
	useConnectionState,
	useQuery,
	useZero,
} from "@package/database/client";
import { A } from "@solidjs/router";
import { createResource, For, Show } from "solid-js";
import { AuthGuard } from "@/components/composite/auth-guard";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { getAuthData } from "@/context/app-provider";
import { Layout } from "@/layout/Layout";
import { getConfig } from "@/lib/config";
import { buildPackageUrl } from "@/lib/url";

const fetchStats = async () => {
	const res = await fetch(`${getConfig().backendUrl}/api/stats`, {
		credentials: "include",
	});
	return res.json() as Promise<{ pendingFetches: number }>;
};

type FetchWithPackage = Row["packageFetches"] & {
	package?: Row["packages"] | null;
};

const formatDate = (timestamp: number | null) => {
	if (!timestamp) return "-";
	return new Date(timestamp).toLocaleString();
};

export const AdminRequests = () => {
	const zero = useZero();

	const isAdmin = () => getAuthData()?.roles?.includes("admin") ?? false;
	const isLoggedIn = () => zero().userID !== "anon";

	const [stats] = createResource(fetchStats);
	const [pendingFetches] = useQuery(() =>
		queries.packageFetches.byStatus({ status: "pending" }),
	);
	const [failedPackages] = useQuery(() => queries.packages.failed());
	const connectionState = useConnectionState();

	const isLoading = () =>
		connectionState().name === "connecting" ||
		pendingFetches() === undefined ||
		failedPackages() === undefined;

	// Top 25 pending fetches
	const topPending = () => (pendingFetches() ?? []).slice(0, 25);
	const pendingCount = () => stats()?.pendingFetches ?? 0;

	return (
		<Layout>
			<Container size="lg">
				<Stack spacing="lg" class="py-8">
					<AuthGuard hasAccess={isLoggedIn() && isAdmin()}>
						<Heading level="h1">Admin Dashboard</Heading>

						<Show
							when={!isLoading()}
							fallback={
								<div class="flex justify-center py-12">
									<Spinner label="Loading..." />
								</div>
							}
						>
							{/* Pending Fetches Section */}
							<Card padding="lg">
								<Stack spacing="md">
									<Flex justify="between" align="center">
										<Heading level="h2">Pending Fetches</Heading>
										<Badge variant="info" size="md">
											{pendingCount().toLocaleString()} in queue
										</Badge>
									</Flex>
									<Show
										when={topPending().length > 0}
										fallback={
											<Text color="muted">No pending fetches in queue.</Text>
										}
									>
										<div class="overflow-x-auto">
											<table class="w-full text-sm">
												<thead>
													<tr class="border-b border-outline dark:border-outline-dark">
														<th class="py-3 px-2 text-left font-medium text-on-surface-muted dark:text-on-surface-dark-muted">
															Package
														</th>
														<th class="py-3 px-2 text-left font-medium text-on-surface-muted dark:text-on-surface-dark-muted">
															Registry
														</th>
														<th class="py-3 px-2 text-left font-medium text-on-surface-muted dark:text-on-surface-dark-muted">
															Created
														</th>
													</tr>
												</thead>
												<tbody>
													<For each={topPending() as FetchWithPackage[]}>
														{(fetch) => (
															<tr class="border-b border-outline/50 dark:border-outline-dark/50">
																<td class="py-3 px-2">
																	<Show
																		when={fetch.package}
																		fallback={
																			<Text size="sm" color="muted">
																				Unknown
																			</Text>
																		}
																	>
																		{(pkg) => (
																			<A
																				href={buildPackageUrl(
																					pkg().registry,
																					pkg().name,
																				)}
																				class="text-primary dark:text-primary-dark hover:underline"
																			>
																				{pkg().name}
																			</A>
																		)}
																	</Show>
																</td>
																<td class="py-3 px-2">
																	<Show when={fetch.package}>
																		{(pkg) => (
																			<Badge variant="secondary" size="sm">
																				{pkg().registry}
																			</Badge>
																		)}
																	</Show>
																</td>
																<td class="py-3 px-2">
																	<Text size="sm" color="muted">
																		{formatDate(fetch.createdAt)}
																	</Text>
																</td>
															</tr>
														)}
													</For>
												</tbody>
											</table>
										</div>
									</Show>
								</Stack>
							</Card>

							{/* Failed Packages Section */}
							<Card padding="lg">
								<Stack spacing="md">
									<Heading level="h2">Failed Packages</Heading>
									<Show
										when={(failedPackages() ?? []).length > 0}
										fallback={
											<Text color="muted">No failed packages.</Text>
										}
									>
										<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
											<For each={failedPackages()}>
												{(pkg) => (
													<A
														href={buildPackageUrl(pkg.registry, pkg.name)}
														class="block"
													>
														<Card
															padding="md"
															class="hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition-colors h-full"
														>
															<Stack spacing="sm">
																<Flex justify="between" align="start" gap="sm">
																	<Text weight="semibold" class="break-all">
																		{pkg.name}
																	</Text>
																	<Badge variant="secondary" size="sm" class="shrink-0">
																		{pkg.registry}
																	</Badge>
																</Flex>
																<Text size="sm" color="danger">
																	{pkg.failureReason || "failed"}
																</Text>
															</Stack>
														</Card>
													</A>
												)}
											</For>
										</div>
									</Show>
								</Stack>
							</Card>
						</Show>
					</AuthGuard>
				</Stack>
			</Container>
		</Layout>
	);
};

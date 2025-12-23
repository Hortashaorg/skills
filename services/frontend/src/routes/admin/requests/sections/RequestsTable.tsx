import type { PackageRequestStatus, Row } from "@package/database/client";
import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Text } from "@/components/primitives/text";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
	requests: readonly Row["packageRequests"][];
	totalCount: number;
	page: number;
	pageSize: number;
	onPageChange: (page: number) => void;
};

const STATUS_BADGE_VARIANT: Record<
	PackageRequestStatus,
	BadgeProps["variant"]
> = {
	pending: "info",
	fetching: "info",
	completed: "success",
	failed: "warning",
	discarded: "danger",
};

const formatDate = (timestamp: number) => {
	return new Date(timestamp).toLocaleString();
};

export const RequestsTable = (props: Props) => {
	const totalPages = () => Math.ceil(props.totalCount / props.pageSize);
	const startIndex = () => props.page * props.pageSize + 1;
	const endIndex = () =>
		Math.min((props.page + 1) * props.pageSize, props.totalCount);

	return (
		<div class="mt-4">
			<Show
				when={props.totalCount > 0}
				fallback={
					<Text color="muted" class="py-8 text-center">
						No requests found.
					</Text>
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
									Status
								</th>
								<th class="py-3 px-2 text-left font-medium text-on-surface-muted dark:text-on-surface-dark-muted">
									Attempts
								</th>
								<th class="py-3 px-2 text-left font-medium text-on-surface-muted dark:text-on-surface-dark-muted">
									Updated
								</th>
								<th class="py-3 px-2 text-left font-medium text-on-surface-muted dark:text-on-surface-dark-muted">
									Error
								</th>
							</tr>
						</thead>
						<tbody>
							<For each={props.requests}>
								{(request) => (
									<tr class="border-b border-outline/50 dark:border-outline-dark/50 hover:bg-surface-alt/50 dark:hover:bg-surface-dark-alt/50">
										<td class="py-3 px-2">
											<Show
												when={request.packageId}
												fallback={<Text size="sm">{request.packageName}</Text>}
											>
												<A
													href={`/package/${encodeURIComponent(request.registry)}/${encodeURIComponent(request.packageName)}`}
													class="text-primary dark:text-primary-dark hover:underline"
												>
													{request.packageName}
												</A>
											</Show>
										</td>
										<td class="py-3 px-2">
											<Badge variant="secondary" size="sm">
												{request.registry}
											</Badge>
										</td>
										<td class="py-3 px-2">
											<Badge
												variant={STATUS_BADGE_VARIANT[request.status]}
												size="sm"
											>
												{request.status}
											</Badge>
										</td>
										<td class="py-3 px-2">
											<Text size="sm" color="muted">
												{request.attemptCount}
											</Text>
										</td>
										<td class="py-3 px-2">
											<Text size="sm" color="muted">
												{formatDate(request.updatedAt)}
											</Text>
										</td>
										<td class="py-3 px-2 max-w-xs">
											<Show when={request.errorMessage}>
												<Text
													size="sm"
													color="muted"
													class="truncate"
													title={request.errorMessage ?? ""}
												>
													{request.errorMessage}
												</Text>
											</Show>
										</td>
									</tr>
								)}
							</For>
						</tbody>
					</table>
				</div>
				<Flex justify="between" align="center" class="mt-4">
					<Text size="sm" color="muted">
						Showing {startIndex()}-{endIndex()} of {props.totalCount} requests
					</Text>
					<Flex gap="sm" align="center">
						<Button
							variant="outline"
							size="sm"
							disabled={props.page === 0}
							onClick={() => props.onPageChange(props.page - 1)}
						>
							Previous
						</Button>
						<Text size="sm" color="muted">
							Page {props.page + 1} of {totalPages()}
						</Text>
						<Button
							variant="outline"
							size="sm"
							disabled={props.page >= totalPages() - 1}
							onClick={() => props.onPageChange(props.page + 1)}
						>
							Next
						</Button>
					</Flex>
				</Flex>
			</Show>
		</div>
	);
};

import { formatDate } from "@package/common";
import { mutators, queries, useQuery, useZero } from "@package/database/client";
import { useNavigate } from "@solidjs/router";
import { createEffect, For, Show } from "solid-js";
import { Container } from "@/components/primitives/container";
import { Flex } from "@/components/primitives/flex";
import { Heading } from "@/components/primitives/heading";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/layout/Layout";

const NotificationSkeleton = () => (
	<Card padding="md">
		<Flex justify="between" align="start" gap="md">
			<Stack spacing="xs" class="flex-1">
				<Skeleton variant="text" width="200px" />
				<Skeleton variant="text" width="300px" />
			</Stack>
			<Skeleton variant="text" width="80px" />
		</Flex>
	</Card>
);

export const Notifications = () => {
	const zero = useZero();
	const navigate = useNavigate();
	const isLoggedIn = () => zero().userID !== "anon";

	createEffect(() => {
		if (!isLoggedIn()) {
			navigate("/", { replace: true });
		}
	});

	const [notifications, notificationsResult] = useQuery(() =>
		queries.notifications.mine(),
	);
	const [unreadNotifications, unreadResult] = useQuery(() =>
		queries.notifications.unreadCount(),
	);

	const isLoading = () =>
		notificationsResult().type !== "complete" ||
		unreadResult().type !== "complete";
	const unreadCount = () => unreadNotifications()?.length ?? 0;

	const handleMarkRead = (id: string) => {
		zero().mutate(mutators.notifications.markRead({ id }));
	};

	const handleMarkUnread = (id: string) => {
		zero().mutate(mutators.notifications.markUnread({ id }));
	};

	const handleMarkAllRead = () => {
		zero().mutate(mutators.notifications.markAllRead());
	};

	return (
		<Layout>
			<Container size="md">
				<Stack spacing="lg" class="py-8">
					<Flex justify="between" align="center">
						<Heading level="h1">Notifications</Heading>
						<Show when={unreadCount() > 0}>
							<Button variant="outline" size="sm" onClick={handleMarkAllRead}>
								Mark all as read
							</Button>
						</Show>
					</Flex>

					<Show
						when={!isLoading()}
						fallback={
							<Stack spacing="md">
								<NotificationSkeleton />
								<NotificationSkeleton />
								<NotificationSkeleton />
							</Stack>
						}
					>
						<Show
							when={(notifications()?.length ?? 0) > 0}
							fallback={
								<Card padding="lg">
									<Text color="muted" class="text-center py-8">
										No notifications yet
									</Text>
								</Card>
							}
						>
							<Stack spacing="md">
								<For each={notifications()}>
									{(notification) => (
										<Card
											padding="md"
											class={
												!notification.read
													? "border-l-4 border-l-primary dark:border-l-primary-dark"
													: ""
											}
										>
											<Flex justify="between" align="start" gap="md">
												<Stack spacing="xs" class="flex-1">
													<Text
														weight={notification.read ? "normal" : "semibold"}
													>
														{notification.title}
													</Text>
													<Text size="sm" color="muted">
														{notification.message}
													</Text>
													<Text size="xs" color="muted">
														{formatDate(notification.createdAt)}
													</Text>
												</Stack>
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														notification.read
															? handleMarkUnread(notification.id)
															: handleMarkRead(notification.id)
													}
												>
													{notification.read ? "Mark unread" : "Mark read"}
												</Button>
											</Flex>
										</Card>
									)}
								</For>
							</Stack>
						</Show>
					</Show>
				</Stack>
			</Container>
		</Layout>
	);
};

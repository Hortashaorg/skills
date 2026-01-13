import { For, Show } from "solid-js";
import { BellIcon } from "@/components/primitives/icon";
import { Text } from "@/components/primitives/text";
import { Dropdown } from "@/components/ui/dropdown";
import type { NavbarNotification } from "./types";

const iconButtonClass =
	"p-2 rounded-full text-on-surface-muted dark:text-on-surface-dark-muted hover:text-on-surface dark:hover:text-on-surface-dark hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition cursor-pointer";

export type NotificationDropdownProps = {
	notifications: readonly NavbarNotification[];
	unreadCount: number;
	onMarkRead: (id: string) => void;
	onMarkAllRead: () => void;
};

export const NotificationDropdown = (props: NotificationDropdownProps) => {
	const formatUnreadCount = () =>
		props.unreadCount >= 20 ? "20+" : props.unreadCount;

	return (
		<Dropdown>
			<Dropdown.Trigger
				aria-label="Notifications"
				class={`relative ${iconButtonClass}`}
			>
				<BellIcon size="sm" />
				<Show when={props.unreadCount > 0}>
					<span class="absolute top-0 right-0 bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark text-xs rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
						{formatUnreadCount()}
					</span>
				</Show>
			</Dropdown.Trigger>
			<Dropdown.Content width="lg">
				<div class="flex items-center justify-between px-4 py-2 border-b border-outline dark:border-outline-dark">
					<Text size="sm" weight="medium">
						Notifications
					</Text>
					<Show when={props.unreadCount > 0}>
						<button
							type="button"
							onClick={props.onMarkAllRead}
							class="text-xs text-primary dark:text-primary-dark hover:underline"
						>
							Mark all read
						</button>
					</Show>
				</div>
				<div class="max-h-80 overflow-y-auto">
					<Show
						when={props.notifications.length > 0}
						fallback={
							<div class="px-4 py-6 text-center">
								<Text size="sm" color="muted">
									No notifications
								</Text>
							</div>
						}
					>
						<For each={props.notifications}>
							{(notification) => (
								<Dropdown.Item
									onSelect={() => props.onMarkRead(notification.id)}
									class={
										!notification.read
											? "bg-primary/5 dark:bg-primary-dark/5"
											: ""
									}
								>
									<Text
										size="sm"
										weight={notification.read ? "normal" : "medium"}
									>
										{notification.title}
									</Text>
									<Text size="xs" color="muted" class="mt-0.5">
										{notification.message}
									</Text>
								</Dropdown.Item>
							)}
						</For>
					</Show>
				</div>
				<Dropdown.LinkItem
					href="/me/notifications"
					class="text-center text-primary dark:text-primary-dark border-t border-outline dark:border-outline-dark"
				>
					View all notifications
				</Dropdown.LinkItem>
			</Dropdown.Content>
		</Dropdown>
	);
};

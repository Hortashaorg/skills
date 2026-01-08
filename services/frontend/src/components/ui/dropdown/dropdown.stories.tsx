import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Text } from "@/components/primitives/text";
import { createThemedStories } from "@/components/story-helpers";
import { Dropdown } from "./dropdown";

const meta = {
	title: "UI/Dropdown",
	component: Dropdown,
	tags: ["autodocs"],
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicBase: Story = {
	render: () => (
		<div class="flex justify-center p-8">
			<Dropdown>
				<Dropdown.Trigger class="px-3 py-1.5 text-sm border border-outline dark:border-outline-dark rounded-radius hover:bg-surface-alt dark:hover:bg-surface-dark-alt text-on-surface dark:text-on-surface-dark">
					Open Menu
				</Dropdown.Trigger>
				<Dropdown.Content width="sm">
					<Dropdown.Item onSelect={() => console.log("Profile")}>
						Profile
					</Dropdown.Item>
					<Dropdown.Item onSelect={() => console.log("Settings")}>
						Settings
					</Dropdown.Item>
					<Dropdown.Separator />
					<Dropdown.Item onSelect={() => console.log("Sign out")}>
						Sign out
					</Dropdown.Item>
				</Dropdown.Content>
			</Dropdown>
		</div>
	),
};

const basicThemed = createThemedStories({
	story: basicBase,
	testMode: "none",
});

export const BasicLight = basicThemed.Light;
export const BasicDark = basicThemed.Dark;

const withLinksBase: Story = {
	render: () => (
		<div class="flex justify-center p-8">
			<Dropdown>
				<Dropdown.Trigger class="px-3 py-1.5 text-sm border border-outline dark:border-outline-dark rounded-radius hover:bg-surface-alt dark:hover:bg-surface-dark-alt text-on-surface dark:text-on-surface-dark">
					Navigation
				</Dropdown.Trigger>
				<Dropdown.Content width="sm">
					<Dropdown.LinkItem href="/profile" active>
						Profile
					</Dropdown.LinkItem>
					<Dropdown.LinkItem href="/projects">My Projects</Dropdown.LinkItem>
					<Dropdown.LinkItem href="/settings">Settings</Dropdown.LinkItem>
					<Dropdown.Separator />
					<Dropdown.Item>Sign out</Dropdown.Item>
				</Dropdown.Content>
			</Dropdown>
		</div>
	),
};

const withLinksThemed = createThemedStories({
	story: withLinksBase,
	testMode: "none",
});

export const WithLinksLight = withLinksThemed.Light;
export const WithLinksDark = withLinksThemed.Dark;

const notificationsBase: Story = {
	render: () => (
		<div class="flex justify-center p-8">
			<Dropdown>
				<Dropdown.Trigger
					aria-label="Notifications"
					class="relative p-2 text-on-surface-muted dark:text-on-surface-dark-muted hover:text-on-surface dark:hover:text-on-surface-dark rounded-full hover:bg-surface-alt dark:hover:bg-surface-dark-alt"
				>
					<svg
						class="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
						/>
					</svg>
					<span class="absolute top-0 right-0 bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark text-xs rounded-full w-4 h-4 flex items-center justify-center">
						2
					</span>
				</Dropdown.Trigger>
				<Dropdown.Content width="lg">
					<div class="flex items-center justify-between px-4 py-2 border-b border-outline dark:border-outline-dark">
						<Text size="sm" weight="medium">
							Notifications
						</Text>
						<button
							type="button"
							class="text-xs text-primary dark:text-primary-dark hover:underline"
						>
							Mark all read
						</button>
					</div>
					<Dropdown.Item class="bg-primary/5 dark:bg-primary-dark/5">
						<Text size="sm" weight="medium">
							New notification
						</Text>
						<Text size="xs" color="muted" class="mt-0.5">
							Something happened
						</Text>
					</Dropdown.Item>
					<Dropdown.Item>
						<Text size="sm">Old notification</Text>
						<Text size="xs" color="muted" class="mt-0.5">
							Something else happened
						</Text>
					</Dropdown.Item>
					<Dropdown.LinkItem
						href="/notifications"
						class="text-center text-primary dark:text-primary-dark border-t border-outline dark:border-outline-dark"
					>
						View all notifications
					</Dropdown.LinkItem>
				</Dropdown.Content>
			</Dropdown>
		</div>
	),
};

const notificationsThemed = createThemedStories({
	story: notificationsBase,
	testMode: "none",
});

export const NotificationsLight = notificationsThemed.Light;
export const NotificationsDark = notificationsThemed.Dark;

import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Text } from "@/components/primitives/text";
import { createThemedStories } from "@/components/story-helpers";
import { HoverDropdown } from "./hover-dropdown";

const meta = {
	title: "UI/HoverDropdown",
	component: HoverDropdown,
	tags: ["autodocs"],
	argTypes: {
		align: {
			control: "select",
			options: ["left", "right"],
			description: "Dropdown alignment relative to trigger",
		},
		width: {
			control: "select",
			options: ["auto", "sm", "md", "lg"],
			description: "Dropdown width",
		},
	},
} satisfies Meta<typeof HoverDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const MenuItems = () => (
	<div class="py-1">
		<button
			type="button"
			class="block w-full text-left px-4 py-2 text-sm hover:bg-surface-alt dark:hover:bg-surface-dark-alt"
		>
			Profile
		</button>
		<button
			type="button"
			class="block w-full text-left px-4 py-2 text-sm hover:bg-surface-alt dark:hover:bg-surface-dark-alt"
		>
			Settings
		</button>
		<div class="border-t border-outline dark:border-outline-dark my-1" />
		<button
			type="button"
			class="block w-full text-left px-4 py-2 text-sm hover:bg-surface-alt dark:hover:bg-surface-dark-alt"
		>
			Sign out
		</button>
	</div>
);

const Trigger = () => (
	<button
		type="button"
		class="px-3 py-1.5 text-sm border border-outline dark:border-outline-dark rounded-radius hover:bg-surface-alt dark:hover:bg-surface-dark-alt text-on-surface dark:text-on-surface-dark"
	>
		Hover me
	</button>
);

// Right aligned (default)
const rightAlignedBase: Story = {
	render: () => (
		<div class="flex justify-center p-8">
			<HoverDropdown trigger={<Trigger />} width="sm">
				<MenuItems />
			</HoverDropdown>
		</div>
	),
};

const rightAlignedThemed = createThemedStories({
	story: rightAlignedBase,
	testMode: "none",
});

export const RightAlignedLight = rightAlignedThemed.Light;
export const RightAlignedDark = rightAlignedThemed.Dark;

// Left aligned
const leftAlignedBase: Story = {
	render: () => (
		<div class="flex justify-center p-8">
			<HoverDropdown trigger={<Trigger />} align="left" width="sm">
				<MenuItems />
			</HoverDropdown>
		</div>
	),
};

const leftAlignedThemed = createThemedStories({
	story: leftAlignedBase,
	testMode: "none",
});

export const LeftAlignedLight = leftAlignedThemed.Light;
export const LeftAlignedDark = leftAlignedThemed.Dark;

// With notifications-like content
const NotificationContent = () => (
	<>
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
		<div class="max-h-60 overflow-y-auto">
			<button
				type="button"
				class="block w-full text-left px-4 py-3 hover:bg-surface-alt dark:hover:bg-surface-dark-alt border-b border-outline/50 dark:border-outline-dark/50"
			>
				<Text size="sm" weight="medium">
					New notification
				</Text>
				<Text size="xs" color="muted" class="mt-0.5">
					Something happened
				</Text>
			</button>
			<button
				type="button"
				class="block w-full text-left px-4 py-3 hover:bg-surface-alt dark:hover:bg-surface-dark-alt"
			>
				<Text size="sm">Old notification</Text>
				<Text size="xs" color="muted" class="mt-0.5">
					Something else happened
				</Text>
			</button>
		</div>
	</>
);

const notificationsBase: Story = {
	render: () => (
		<div class="flex justify-center p-8">
			<HoverDropdown
				trigger={
					<button
						type="button"
						class="relative p-2 text-on-surface-muted dark:text-on-surface-dark-muted hover:text-on-surface dark:hover:text-on-surface-dark"
					>
						<svg
							class="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>Notifications</title>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
							/>
						</svg>
						<span class="absolute -top-1 -right-1 bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark text-xs rounded-full w-4 h-4 flex items-center justify-center">
							2
						</span>
					</button>
				}
				width="lg"
			>
				<NotificationContent />
			</HoverDropdown>
		</div>
	),
};

const notificationsThemed = createThemedStories({
	story: notificationsBase,
	testMode: "none",
});

export const NotificationsLight = notificationsThemed.Light;
export const NotificationsDark = notificationsThemed.Dark;

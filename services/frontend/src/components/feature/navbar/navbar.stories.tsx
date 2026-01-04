import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { Navbar, type NavbarNotification } from "./navbar";

const meta = {
	title: "Feature/Navbar",
	component: Navbar,
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<div style={{ "min-width": "1024px" }}>
				<Story />
			</div>
		),
	],
	parameters: {
		layout: "fullscreen",
		viewport: {
			defaultViewport: "desktop",
		},
		chromatic: {
			viewports: [1280],
		},
	},
	argTypes: {
		isLoggedIn: {
			control: "boolean",
			description: "Whether user is logged in",
		},
		isAdmin: {
			control: "boolean",
			description: "Whether user has admin role",
		},
		connectionState: {
			control: "select",
			options: [
				"connected",
				"connecting",
				"disconnected",
				"needs-auth",
				"error",
				"closed",
			],
			description: "WebSocket connection state",
		},
		unreadCount: {
			control: "number",
			description: "Number of unread notifications",
		},
	},
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleNotifications: NavbarNotification[] = [
	{
		id: "1",
		title: "Suggestion approved",
		message: "Your tag suggestion was approved and applied.",
		read: false,
	},
	{
		id: "2",
		title: "Suggestion rejected",
		message: "Your tag suggestion was rejected by the community.",
		read: false,
	},
	{
		id: "3",
		title: "Welcome to TechGarden",
		message: "Thanks for joining! Start by exploring packages.",
		read: true,
	},
];

const defaultArgs = {
	currentPath: "/packages",
	connectionState: "connected" as const,
	notifications: [] as NavbarNotification[],
	unreadCount: 0,
	onLogout: () => console.log("Logout clicked"),
	onSignIn: () => console.log("Sign in clicked"),
	onMarkRead: (id: string) => console.log("Mark read:", id),
	onMarkAllRead: () => console.log("Mark all read"),
};

// Logged out state
const loggedOutBase: Story = {
	args: {
		...defaultArgs,
		isLoggedIn: false,
		isAdmin: false,
	},
};

const loggedOutThemed = createThemedStories({
	story: loggedOutBase,
	testMode: "both",
});

export const LoggedOutLight = loggedOutThemed.Light;
export const LoggedOutDark = loggedOutThemed.Dark;

// Logged in - regular user
const loggedInBase: Story = {
	args: {
		...defaultArgs,
		isLoggedIn: true,
		isAdmin: false,
		notifications: sampleNotifications,
		unreadCount: 2,
	},
};

const loggedInThemed = createThemedStories({
	story: loggedInBase,
	testMode: "both",
});

export const LoggedInLight = loggedInThemed.Light;
export const LoggedInDark = loggedInThemed.Dark;

// Logged in - admin user
const adminBase: Story = {
	args: {
		...defaultArgs,
		isLoggedIn: true,
		isAdmin: true,
		notifications: sampleNotifications,
		unreadCount: 2,
		currentPath: "/admin/requests",
	},
};

const adminThemed = createThemedStories({
	story: adminBase,
	testMode: "both",
});

export const AdminLight = adminThemed.Light;
export const AdminDark = adminThemed.Dark;

// Many notifications (20+)
const manyNotificationsBase: Story = {
	args: {
		...defaultArgs,
		isLoggedIn: true,
		isAdmin: false,
		notifications: sampleNotifications,
		unreadCount: 25,
	},
};

const manyNotificationsThemed = createThemedStories({
	story: manyNotificationsBase,
	testMode: "none",
});

export const ManyNotificationsLight = manyNotificationsThemed.Light;
export const ManyNotificationsDark = manyNotificationsThemed.Dark;

// Connection states
const connectingBase: Story = {
	args: {
		...defaultArgs,
		isLoggedIn: true,
		isAdmin: false,
		connectionState: "connecting",
	},
};

const connectingThemed = createThemedStories({
	story: connectingBase,
	testMode: "none",
});

export const ConnectingLight = connectingThemed.Light;
export const ConnectingDark = connectingThemed.Dark;

const disconnectedBase: Story = {
	args: {
		...defaultArgs,
		isLoggedIn: true,
		isAdmin: false,
		connectionState: "disconnected",
	},
};

const disconnectedThemed = createThemedStories({
	story: disconnectedBase,
	testMode: "none",
});

export const DisconnectedLight = disconnectedThemed.Light;
export const DisconnectedDark = disconnectedThemed.Dark;

const errorBase: Story = {
	args: {
		...defaultArgs,
		isLoggedIn: true,
		isAdmin: false,
		connectionState: "error",
	},
};

const errorThemed = createThemedStories({
	story: errorBase,
	testMode: "none",
});

export const ConnectionErrorLight = errorThemed.Light;
export const ConnectionErrorDark = errorThemed.Dark;

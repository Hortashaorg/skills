import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import {
	type LeaderboardEntry,
	LeaderboardPreview,
} from "./leaderboard-preview";

const meta = {
	title: "Feature/LeaderboardPreview",
	component: LeaderboardPreview,
	tags: ["autodocs"],
	argTypes: {
		title: {
			control: "text",
			description: "Leaderboard title",
		},
		subtitle: {
			control: "text",
			description: "Subtitle shown next to title",
		},
		viewAllHref: {
			control: "text",
			description: "Link URL for 'View all' action",
		},
		viewAllText: {
			control: "text",
			description: "Text for the view all link",
		},
	},
} satisfies Meta<typeof LeaderboardPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleEntries: LeaderboardEntry[] = [
	{ rank: 1, name: "Alice", score: 1250 },
	{ rank: 2, name: "Bob", score: 980 },
	{ rank: 3, name: "Charlie", score: 875 },
	{ rank: 4, name: "Diana", score: 720 },
	{ rank: 5, name: "Eve", score: 650 },
];

const entriesWithCurrentUser: LeaderboardEntry[] = [
	{ rank: 1, name: "Alice", score: 1250 },
	{ rank: 2, name: "Bob", score: 980 },
	{ rank: 3, name: "You", score: 875, isCurrentUser: true },
	{ rank: 4, name: "Diana", score: 720 },
	{ rank: 5, name: "Eve", score: 650 },
];

// Default with entries
const defaultBase: Story = {
	args: {
		entries: sampleEntries,
		viewAllHref: "/curation",
	},
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "both",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

// Empty state
const emptyBase: Story = {
	args: {
		entries: [],
		viewAllHref: "/curation",
	},
};

const emptyThemed = createThemedStories({
	story: emptyBase,
	testMode: "both",
});

export const EmptyLight = emptyThemed.Light;
export const EmptyDark = emptyThemed.Dark;

// With current user highlighted
const currentUserBase: Story = {
	args: {
		entries: entriesWithCurrentUser,
		viewAllHref: "/curation",
	},
};

const currentUserThemed = createThemedStories({
	story: currentUserBase,
	testMode: "both",
});

export const CurrentUserLight = currentUserThemed.Light;
export const CurrentUserDark = currentUserThemed.Dark;

// Custom title and subtitle
const customTitleBase: Story = {
	args: {
		entries: sampleEntries,
		title: "Weekly Champions",
		subtitle: "Last 7 days",
		viewAllHref: "/leaderboard",
		viewAllText: "See all rankings",
	},
};

const customTitleThemed = createThemedStories({
	story: customTitleBase,
	testMode: "light",
});

export const CustomTitleLight = customTitleThemed.Light;
export const CustomTitleDark = customTitleThemed.Dark;

// Without view all link
const noLinkBase: Story = {
	args: {
		entries: sampleEntries.slice(0, 3),
	},
};

const noLinkThemed = createThemedStories({
	story: noLinkBase,
	testMode: "light",
});

export const NoLinkLight = noLinkThemed.Light;
export const NoLinkDark = noLinkThemed.Dark;

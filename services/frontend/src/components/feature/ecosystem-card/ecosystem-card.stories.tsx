import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { EcosystemCard } from "./ecosystem-card";

const meta = {
	title: "Feature/EcosystemCard",
	component: EcosystemCard,
	tags: ["autodocs"],
	argTypes: {
		name: {
			control: "text",
			description: "Ecosystem name",
		},
		description: {
			control: "text",
			description: "Ecosystem description",
		},
		packageCount: {
			control: "number",
			description: "Number of packages in the ecosystem",
		},
		upvoteCount: {
			control: "number",
			description: "Number of upvotes",
		},
		isUpvoted: {
			control: "boolean",
			description: "Whether the current user has upvoted",
		},
		upvoteDisabled: {
			control: "boolean",
			description: "Whether upvoting is disabled",
		},
		isPending: {
			control: "boolean",
			description: "Whether the ecosystem is pending approval",
		},
	},
} satisfies Meta<typeof EcosystemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default ecosystem card
const defaultBase: Story = {
	args: {
		name: "React Ecosystem",
		href: "/ecosystem/react",
		description:
			"A JavaScript library for building user interfaces with a component-based architecture.",
		packageCount: 24,
		upvoteCount: 128,
		isUpvoted: false,
		upvoteDisabled: false,
		onUpvote: () => console.log("upvote toggled"),
		tags: [
			{ name: "frontend", slug: "frontend" },
			{ name: "javascript", slug: "javascript" },
		],
	},
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "both",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

// Upvoted state
const upvotedBase: Story = {
	args: {
		...defaultBase.args,
		isUpvoted: true,
		upvoteCount: 129,
	},
};

const upvotedThemed = createThemedStories({
	story: upvotedBase,
	testMode: "both",
});

export const UpvotedLight = upvotedThemed.Light;
export const UpvotedDark = upvotedThemed.Dark;

// Disabled upvote (anonymous user)
const disabledUpvoteBase: Story = {
	args: {
		...defaultBase.args,
		upvoteDisabled: true,
	},
};

const disabledUpvoteThemed = createThemedStories({
	story: disabledUpvoteBase,
	testMode: "both",
});

export const DisabledUpvoteLight = disabledUpvoteThemed.Light;
export const DisabledUpvoteDark = disabledUpvoteThemed.Dark;

// Without tags
const noTagsBase: Story = {
	args: {
		...defaultBase.args,
		tags: undefined,
	},
};

const noTagsThemed = createThemedStories({
	story: noTagsBase,
	testMode: "light",
});

export const NoTagsLight = noTagsThemed.Light;
export const NoTagsDark = noTagsThemed.Dark;

// With many tags
const manyTagsBase: Story = {
	args: {
		...defaultBase.args,
		tags: [
			{ name: "frontend", slug: "frontend" },
			{ name: "javascript", slug: "javascript" },
			{ name: "typescript", slug: "typescript" },
			{ name: "ui", slug: "ui" },
			{ name: "web", slug: "web" },
		],
	},
};

const manyTagsThemed = createThemedStories({
	story: manyTagsBase,
	testMode: "light",
});

export const ManyTagsLight = manyTagsThemed.Light;
export const ManyTagsDark = manyTagsThemed.Dark;

// Pending state (suggested ecosystem)
const pendingBase: Story = {
	args: {
		name: "Suggested Ecosystem",
		href: "/ecosystem/suggested",
		description: "A new ecosystem that has been suggested by the community.",
		upvoteCount: 0,
		isUpvoted: false,
		upvoteDisabled: true,
		onUpvote: () => {},
		isPending: true,
	},
};

const pendingThemed = createThemedStories({
	story: pendingBase,
	testMode: "both",
});

export const PendingLight = pendingThemed.Light;
export const PendingDark = pendingThemed.Dark;

// Without package count
const noPackageCountBase: Story = {
	args: {
		...defaultBase.args,
		packageCount: undefined,
	},
};

const noPackageCountThemed = createThemedStories({
	story: noPackageCountBase,
	testMode: "light",
});

export const NoPackageCountLight = noPackageCountThemed.Light;
export const NoPackageCountDark = noPackageCountThemed.Dark;

// Zero packages
const zeroPackagesBase: Story = {
	args: {
		...defaultBase.args,
		packageCount: 0,
	},
};

const zeroPackagesThemed = createThemedStories({
	story: zeroPackagesBase,
	testMode: "light",
});

export const ZeroPackagesLight = zeroPackagesThemed.Light;
export const ZeroPackagesDark = zeroPackagesThemed.Dark;

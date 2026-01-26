import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Text } from "@/components/primitives/text";
import { createThemedStories } from "@/components/story-helpers";
import { Badge } from "@/components/ui/badge";
import { ResourceCard } from "./resource-card";

const meta = {
	title: "Composite/ResourceCard",
	component: ResourceCard,
	tags: ["autodocs"],
	argTypes: {
		status: {
			control: "select",
			options: ["default", "pending", "failed"],
			description: "Card status variant",
		},
		name: {
			control: "text",
			description: "Resource name",
		},
		description: {
			control: "text",
			description: "Resource description",
		},
		badge: {
			control: "text",
			description: "Optional badge text (e.g., registry name)",
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
			description: "Whether upvoting is disabled (e.g., not logged in)",
		},
	},
} satisfies Meta<typeof ResourceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default - like a package card
const defaultBase: Story = {
	args: {
		name: "react",
		href: "/package/npm/react",
		description:
			"A declarative, efficient, and flexible JavaScript library for building user interfaces.",
		badge: "npm",
		upvoteCount: 42,
		isUpvoted: false,
		upvoteDisabled: false,
		onUpvote: () => console.log("upvote toggled"),
		tags: [
			{ name: "frontend", slug: "frontend" },
			{ name: "ui", slug: "ui" },
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
		upvoteCount: 43,
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

// Without badge - like an ecosystem card
const noBadgeBase: Story = {
	args: {
		name: "React Ecosystem",
		href: "/ecosystem/react",
		description:
			"The React ecosystem includes libraries, frameworks, and tools for building modern web applications.",
		upvoteCount: 128,
		isUpvoted: false,
		upvoteDisabled: false,
		onUpvote: () => console.log("upvote toggled"),
		tags: [
			{ name: "frontend", slug: "frontend" },
			{ name: "javascript", slug: "javascript" },
			{ name: "typescript", slug: "typescript" },
		],
		footer: (
			<Text size="xs" color="muted">
				24 packages
			</Text>
		),
	},
};

const noBadgeThemed = createThemedStories({
	story: noBadgeBase,
	testMode: "both",
});

export const NoBadgeLight = noBadgeThemed.Light;
export const NoBadgeDark = noBadgeThemed.Dark;

// With many tags (shows "+N more")
const manyTagsBase: Story = {
	args: {
		...defaultBase.args,
		tags: [
			{ name: "frontend", slug: "frontend" },
			{ name: "ui", slug: "ui" },
			{ name: "javascript", slug: "javascript" },
			{ name: "typescript", slug: "typescript" },
			{ name: "react", slug: "react" },
		],
	},
};

const manyTagsThemed = createThemedStories({
	story: manyTagsBase,
	testMode: "light",
});

export const ManyTagsLight = manyTagsThemed.Light;
export const ManyTagsDark = manyTagsThemed.Dark;

// Pending status
const pendingBase: Story = {
	args: {
		name: "Suggested Ecosystem",
		href: "/ecosystem/suggested",
		description: "A new ecosystem that has been suggested by the community.",
		upvoteCount: 0,
		isUpvoted: false,
		upvoteDisabled: true,
		onUpvote: () => {},
		status: "pending",
	},
};

const pendingThemed = createThemedStories({
	story: pendingBase,
	testMode: "both",
});

export const PendingLight = pendingThemed.Light;
export const PendingDark = pendingThemed.Dark;

// Failed status
const failedBase: Story = {
	args: {
		...defaultBase.args,
		status: "failed",
		failureReason: "Package not found",
	},
};

const failedThemed = createThemedStories({
	story: failedBase,
	testMode: "both",
});

export const FailedLight = failedThemed.Light;
export const FailedDark = failedThemed.Dark;

// With custom footer content
const customFooterBase: Story = {
	args: {
		...defaultBase.args,
		footer: (
			<Badge variant="secondary" size="sm">
				v18.2.0
			</Badge>
		),
	},
};

const customFooterThemed = createThemedStories({
	story: customFooterBase,
	testMode: "light",
});

export const CustomFooterLight = customFooterThemed.Light;
export const CustomFooterDark = customFooterThemed.Dark;

// With remove button
const withRemoveBase: Story = {
	args: {
		...defaultBase.args,
		onRemove: () => console.log("remove clicked"),
	},
};

const withRemoveThemed = createThemedStories({
	story: withRemoveBase,
	testMode: "both",
});

export const WithRemoveLight = withRemoveThemed.Light;
export const WithRemoveDark = withRemoveThemed.Dark;

// Long name with remove button (ecosystem/project context)
const longNameRemoveBase: Story = {
	args: {
		name: "@angular/platform-browser-dynamic",
		href: "/package/npm/@angular/platform-browser-dynamic",
		description:
			"Library for running Angular apps in a web browser with JIT compilation.",
		badge: "npm",
		upvoteCount: 156,
		isUpvoted: false,
		upvoteDisabled: false,
		onUpvote: () => console.log("upvote toggled"),
		onRemove: () => console.log("remove clicked"),
	},
};

const longNameRemoveThemed = createThemedStories({
	story: longNameRemoveBase,
	testMode: "both",
});

export const LongNameRemoveLight = longNameRemoveThemed.Light;
export const LongNameRemoveDark = longNameRemoveThemed.Dark;

// Mobile width simulation (320px) - worst case: long name + tags + remove
const mobileBase: Story = {
	render: () => (
		<div style={{ "max-width": "288px" }}>
			<ResourceCard
				name="@typescript-eslint/eslint-plugin"
				href="#"
				description="An ESLint plugin which provides lint rules for TypeScript codebases."
				badge="npm"
				upvoteCount={1024}
				isUpvoted={true}
				upvoteDisabled={false}
				onUpvote={() => {}}
				onRemove={() => {}}
				tags={[
					{ name: "typescript", slug: "typescript" },
					{ name: "linting", slug: "linting" },
					{ name: "developer-tools", slug: "developer-tools" },
				]}
			/>
		</div>
	),
};

const mobileThemed = createThemedStories({
	story: mobileBase,
	testMode: "both",
});

export const MobileLight = mobileThemed.Light;
export const MobileDark = mobileThemed.Dark;

// Minimal card (no tags, no badge, no description - ecosystem pending)
const minimalBase: Story = {
	args: {
		name: "express",
		href: "/package/npm/express",
		badge: "npm",
		upvoteCount: 7,
		isUpvoted: false,
		upvoteDisabled: false,
		onUpvote: () => {},
	},
};

const minimalThemed = createThemedStories({
	story: minimalBase,
	testMode: "light",
});

export const MinimalLight = minimalThemed.Light;
export const MinimalDark = minimalThemed.Dark;

// All variants showcase
const allVariantsBase: Story = {
	render: () => (
		<div style={{ display: "flex", "flex-direction": "column", gap: "1rem" }}>
			<ResourceCard
				name="Default Package"
				href="#"
				description="A standard package card with badge and tags."
				badge="npm"
				upvoteCount={42}
				isUpvoted={false}
				upvoteDisabled={false}
				onUpvote={() => {}}
				tags={[
					{ name: "frontend", slug: "frontend" },
					{ name: "ui", slug: "ui" },
				]}
			/>
			<ResourceCard
				name="Ecosystem Card"
				href="#"
				description="An ecosystem card without badge, with package count."
				upvoteCount={128}
				isUpvoted={true}
				upvoteDisabled={false}
				onUpvote={() => {}}
				tags={[{ name: "react", slug: "react" }]}
				footer={
					<Text size="xs" color="muted">
						24 packages
					</Text>
				}
			/>
			<ResourceCard
				name="Pending Suggestion"
				href="#"
				description="A pending suggestion awaiting approval."
				upvoteCount={0}
				isUpvoted={false}
				upvoteDisabled={true}
				onUpvote={() => {}}
				status="pending"
			/>
			<ResourceCard
				name="Failed Package"
				href="#"
				description="A package that failed to fetch."
				badge="npm"
				upvoteCount={5}
				isUpvoted={false}
				upvoteDisabled={false}
				onUpvote={() => {}}
				status="failed"
				failureReason="not found"
			/>
		</div>
	),
};

const allVariantsThemed = createThemedStories({
	story: allVariantsBase,
	testMode: "light",
});

export const AllVariantsLight = allVariantsThemed.Light;
export const AllVariantsDark = allVariantsThemed.Dark;

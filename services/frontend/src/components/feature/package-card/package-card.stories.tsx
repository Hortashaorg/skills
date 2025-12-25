import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { PackageCard } from "./package-card";

const meta = {
	title: "Feature/PackageCard",
	component: PackageCard,
	tags: ["autodocs"],
	argTypes: {
		name: {
			control: "text",
			description: "Package name",
		},
		registry: {
			control: "text",
			description: "Registry (npm, jsr, etc.)",
		},
		description: {
			control: "text",
			description: "Package description",
		},
		href: {
			control: "text",
			description: "Link destination",
		},
		upvoteCount: {
			control: "number",
			description: "Current upvote count",
		},
		isUpvoted: {
			control: "boolean",
			description: "Whether user has upvoted",
		},
		upvoteDisabled: {
			control: "boolean",
			description: "Whether upvoting is disabled",
		},
	},
} satisfies Meta<typeof PackageCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultBase: Story = {
	args: {
		name: "lodash",
		registry: "npm",
		description:
			"A modern JavaScript utility library delivering modularity, performance & extras.",
		href: "/package/npm/lodash",
		upvoteCount: 42,
		isUpvoted: false,
		upvoteDisabled: false,
		onUpvote: () => {},
	},
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "both",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

const upvotedBase: Story = {
	args: {
		name: "react",
		registry: "npm",
		description: "A JavaScript library for building user interfaces.",
		href: "/package/npm/react",
		upvoteCount: 128,
		isUpvoted: true,
		upvoteDisabled: false,
		onUpvote: () => {},
	},
};

const upvotedThemed = createThemedStories({
	story: upvotedBase,
	testMode: "both",
});

export const UpvotedLight = upvotedThemed.Light;
export const UpvotedDark = upvotedThemed.Dark;

const disabledBase: Story = {
	args: {
		name: "vue",
		registry: "npm",
		description:
			"The Progressive JavaScript Framework for building modern web UI.",
		href: "/package/npm/vue",
		upvoteCount: 85,
		isUpvoted: false,
		upvoteDisabled: true,
		onUpvote: () => {},
	},
};

const disabledThemed = createThemedStories({
	story: disabledBase,
	testMode: "both",
});

export const DisabledLight = disabledThemed.Light;
export const DisabledDark = disabledThemed.Dark;

const noDescriptionBase: Story = {
	args: {
		name: "@types/node",
		registry: "npm",
		description: null,
		href: "/package/npm/%40types%2Fnode",
		upvoteCount: 15,
		isUpvoted: false,
		upvoteDisabled: false,
		onUpvote: () => {},
	},
};

const noDescriptionThemed = createThemedStories({
	story: noDescriptionBase,
	testMode: "both",
});

export const NoDescriptionLight = noDescriptionThemed.Light;
export const NoDescriptionDark = noDescriptionThemed.Dark;

const longNameBase: Story = {
	args: {
		name: "@angular/platform-browser-dynamic",
		registry: "npm",
		description: "Angular - library for using Angular in a web browser",
		href: "/package/npm/%40angular%2Fplatform-browser-dynamic",
		upvoteCount: 7,
		isUpvoted: false,
		upvoteDisabled: false,
		onUpvote: () => {},
	},
};

const longNameThemed = createThemedStories({
	story: longNameBase,
	testMode: "both",
});

export const LongNameLight = longNameThemed.Light;
export const LongNameDark = longNameThemed.Dark;

const allVariantsBase: Story = {
	render: () => (
		<div style={{ display: "grid", gap: "1rem", "max-width": "400px" }}>
			<PackageCard
				name="lodash"
				registry="npm"
				description="A modern JavaScript utility library."
				href="/package/npm/lodash"
				upvoteCount={42}
				isUpvoted={false}
				upvoteDisabled={false}
				onUpvote={() => {}}
			/>
			<PackageCard
				name="react"
				registry="npm"
				description="A JavaScript library for building user interfaces."
				href="/package/npm/react"
				upvoteCount={128}
				isUpvoted={true}
				upvoteDisabled={false}
				onUpvote={() => {}}
			/>
			<PackageCard
				name="@std/path"
				registry="jsr"
				description={null}
				href="/package/jsr/%40std%2Fpath"
				upvoteCount={5}
				isUpvoted={false}
				upvoteDisabled={true}
				onUpvote={() => {}}
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

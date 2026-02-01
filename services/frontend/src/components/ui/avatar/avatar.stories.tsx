import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { Avatar } from "@/components/ui/avatar";

const meta = {
	title: "UI/Avatar",
	component: Avatar,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["primary", "secondary", "muted"],
			description: "Avatar color variant",
		},
		size: {
			control: "select",
			options: ["sm", "md"],
			description: "Avatar size",
		},
		initials: {
			control: "text",
			description: "Initials to display (1-2 characters)",
		},
	},
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

const primaryBase: Story = {
	args: {
		variant: "primary",
		initials: "S",
	},
};

const primaryThemed = createThemedStories({
	story: primaryBase,
	testMode: "both",
});

export const PrimaryLight = primaryThemed.Light;
export const PrimaryDark = primaryThemed.Dark;

const secondaryBase: Story = {
	args: {
		variant: "secondary",
		initials: "M",
	},
};

const secondaryThemed = createThemedStories({
	story: secondaryBase,
	testMode: "both",
});

export const SecondaryLight = secondaryThemed.Light;
export const SecondaryDark = secondaryThemed.Dark;

const mutedBase: Story = {
	args: {
		variant: "muted",
		initials: "?",
	},
};

const mutedThemed = createThemedStories({
	story: mutedBase,
	testMode: "both",
});

export const MutedLight = mutedThemed.Light;
export const MutedDark = mutedThemed.Dark;

const smallBase: Story = {
	args: {
		size: "sm",
		initials: "A",
	},
};

const smallThemed = createThemedStories({
	story: smallBase,
	testMode: "both",
});

export const SmallLight = smallThemed.Light;
export const SmallDark = smallThemed.Dark;

const mediumBase: Story = {
	args: {
		size: "md",
		initials: "B",
	},
};

const mediumThemed = createThemedStories({
	story: mediumBase,
	testMode: "both",
});

export const MediumLight = mediumThemed.Light;
export const MediumDark = mediumThemed.Dark;

const allVariantsBase: Story = {
	render: () => (
		<div style={{ display: "flex", gap: "1rem", "align-items": "center" }}>
			<Avatar variant="primary" initials="P" />
			<Avatar variant="secondary" initials="S" />
			<Avatar variant="muted" initials="?" />
		</div>
	),
};

const allVariantsThemed = createThemedStories({
	story: allVariantsBase,
	testMode: "light",
});

export const AllVariantsLight = allVariantsThemed.Light;
export const AllVariantsDark = allVariantsThemed.Dark;

const allSizesBase: Story = {
	render: () => (
		<div style={{ display: "flex", gap: "1rem", "align-items": "center" }}>
			<Avatar size="sm" initials="S" />
			<Avatar size="md" initials="M" />
		</div>
	),
};

const allSizesThemed = createThemedStories({
	story: allSizesBase,
	testMode: "light",
});

export const AllSizesLight = allSizesThemed.Light;
export const AllSizesDark = allSizesThemed.Dark;

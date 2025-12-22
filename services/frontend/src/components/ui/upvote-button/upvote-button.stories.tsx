import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { UpvoteButton } from "./upvote-button";

const meta = {
	title: "UI/UpvoteButton",
	component: UpvoteButton,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md"],
			description: "Button size",
		},
		count: {
			control: "number",
			description: "Upvote count",
		},
		isUpvoted: {
			control: "boolean",
			description: "Whether the user has upvoted",
		},
		disabled: {
			control: "boolean",
			description: "Whether the button is disabled",
		},
	},
} satisfies Meta<typeof UpvoteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultBase: Story = {
	args: {
		count: 42,
		isUpvoted: false,
		size: "sm",
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
		count: 43,
		isUpvoted: true,
		size: "sm",
	},
};

const upvotedThemed = createThemedStories({
	story: upvotedBase,
	testMode: "both",
});

export const UpvotedLight = upvotedThemed.Light;
export const UpvotedDark = upvotedThemed.Dark;

const mediumBase: Story = {
	args: {
		count: 128,
		isUpvoted: false,
		size: "md",
	},
};

const mediumThemed = createThemedStories({
	story: mediumBase,
	testMode: "both",
});

export const MediumLight = mediumThemed.Light;
export const MediumDark = mediumThemed.Dark;

const disabledBase: Story = {
	args: {
		count: 15,
		isUpvoted: false,
		disabled: true,
	},
};

const disabledThemed = createThemedStories({
	story: disabledBase,
	testMode: "none",
});

export const DisabledLight = disabledThemed.Light;
export const DisabledDark = disabledThemed.Dark;

const allVariantsBase: Story = {
	render: () => (
		<div
			style={{
				display: "flex",
				gap: "1rem",
				"flex-wrap": "wrap",
				"align-items": "center",
			}}
		>
			<UpvoteButton count={0} isUpvoted={false} size="sm" />
			<UpvoteButton count={42} isUpvoted={false} size="sm" />
			<UpvoteButton count={43} isUpvoted={true} size="sm" />
			<UpvoteButton count={128} isUpvoted={false} size="md" />
			<UpvoteButton count={129} isUpvoted={true} size="md" />
			<UpvoteButton count={15} isUpvoted={false} disabled />
		</div>
	),
};

const allVariantsThemed = createThemedStories({
	story: allVariantsBase,
	testMode: "light",
});

export const AllVariantsLight = allVariantsThemed.Light;
export const AllVariantsDark = allVariantsThemed.Dark;

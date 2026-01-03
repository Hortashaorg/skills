import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { Skeleton } from "./skeleton";

const meta = {
	title: "UI/Skeleton",
	component: Skeleton,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["text", "circular", "rectangular"],
			description: "Shape variant",
		},
		width: {
			control: "text",
			description: "Custom width",
		},
		height: {
			control: "text",
			description: "Custom height",
		},
	},
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Text variant (default)
const textBase: Story = {
	args: {
		variant: "text",
	},
};

const textThemed = createThemedStories({
	story: textBase,
	testMode: "both",
});

export const TextLight = textThemed.Light;
export const TextDark = textThemed.Dark;

// Circular variant
const circularBase: Story = {
	args: {
		variant: "circular",
		width: "48px",
		height: "48px",
	},
};

const circularThemed = createThemedStories({
	story: circularBase,
	testMode: "both",
});

export const CircularLight = circularThemed.Light;
export const CircularDark = circularThemed.Dark;

// Rectangular variant
const rectangularBase: Story = {
	args: {
		variant: "rectangular",
		width: "100%",
		height: "120px",
	},
};

const rectangularThemed = createThemedStories({
	story: rectangularBase,
	testMode: "both",
});

export const RectangularLight = rectangularThemed.Light;
export const RectangularDark = rectangularThemed.Dark;

// Card-like skeleton
const cardBase: Story = {
	render: () => (
		<div class="flex flex-col gap-3 p-4 border border-outline dark:border-outline-dark rounded-radius w-75">
			<Skeleton variant="rectangular" height="140px" />
			<Skeleton variant="text" width="80%" />
			<Skeleton variant="text" width="60%" />
			<div class="flex gap-2 items-center">
				<Skeleton variant="circular" width="32px" height="32px" />
				<Skeleton variant="text" width="100px" />
			</div>
		</div>
	),
};

const cardThemed = createThemedStories({
	story: cardBase,
	testMode: "light",
});

export const CardSkeletonLight = cardThemed.Light;
export const CardSkeletonDark = cardThemed.Dark;

// All variants showcase
const allVariantsBase: Story = {
	render: () => (
		<div class="flex flex-col gap-4">
			<div>
				<p class="mb-2 text-sm text-on-surface dark:text-on-surface-dark">
					Text (default)
				</p>
				<Skeleton variant="text" />
			</div>
			<div>
				<p class="mb-2 text-sm text-on-surface dark:text-on-surface-dark">
					Text with custom width
				</p>
				<Skeleton variant="text" width="60%" />
			</div>
			<div>
				<p class="mb-2 text-sm text-on-surface dark:text-on-surface-dark">
					Circular (avatar)
				</p>
				<Skeleton variant="circular" width="48px" height="48px" />
			</div>
			<div>
				<p class="mb-2 text-sm text-on-surface dark:text-on-surface-dark">
					Rectangular (image/card)
				</p>
				<Skeleton variant="rectangular" width="200px" height="100px" />
			</div>
		</div>
	),
};

const allVariantsThemed = createThemedStories({
	story: allVariantsBase,
	testMode: "light",
});

export const AllVariantsLight = allVariantsThemed.Light;
export const AllVariantsDark = allVariantsThemed.Dark;

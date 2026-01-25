import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { Badge } from "./badge";

const meta = {
	title: "UI/Badge",
	component: Badge,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: [
				"primary",
				"secondary",
				"success",
				"danger",
				"warning",
				"info",
				"outline",
				"subtle",
			],
			description: "Badge color variant",
		},
		size: {
			control: "select",
			options: ["sm", "md"],
			description: "Badge size",
		},
	},
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

const primaryBase: Story = {
	args: {
		variant: "primary",
		children: "Primary",
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
		children: "Secondary",
	},
};

const secondaryThemed = createThemedStories({
	story: secondaryBase,
	testMode: "both",
});

export const SecondaryLight = secondaryThemed.Light;
export const SecondaryDark = secondaryThemed.Dark;

const successBase: Story = {
	args: {
		variant: "success",
		children: "Success",
	},
};

const successThemed = createThemedStories({
	story: successBase,
	testMode: "both",
});

export const SuccessLight = successThemed.Light;
export const SuccessDark = successThemed.Dark;

const dangerBase: Story = {
	args: {
		variant: "danger",
		children: "Danger",
	},
};

const dangerThemed = createThemedStories({
	story: dangerBase,
	testMode: "both",
});

export const DangerLight = dangerThemed.Light;
export const DangerDark = dangerThemed.Dark;

const warningBase: Story = {
	args: {
		variant: "warning",
		children: "Warning",
	},
};

const warningThemed = createThemedStories({
	story: warningBase,
	testMode: "both",
});

export const WarningLight = warningThemed.Light;
export const WarningDark = warningThemed.Dark;

const infoBase: Story = {
	args: {
		variant: "info",
		children: "Info",
	},
};

const infoThemed = createThemedStories({
	story: infoBase,
	testMode: "both",
});

export const InfoLight = infoThemed.Light;
export const InfoDark = infoThemed.Dark;

const outlineBase: Story = {
	args: {
		variant: "outline",
		children: "+ Add tag",
		as: "button",
	},
};

const outlineThemed = createThemedStories({
	story: outlineBase,
	testMode: "both",
});

export const OutlineLight = outlineThemed.Light;
export const OutlineDark = outlineThemed.Dark;

const subtleBase: Story = {
	args: {
		variant: "subtle",
		children: "npm",
	},
};

const subtleThemed = createThemedStories({
	story: subtleBase,
	testMode: "both",
});

export const SubtleLight = subtleThemed.Light;
export const SubtleDark = subtleThemed.Dark;

const smallBase: Story = {
	args: {
		size: "sm",
		children: "Small Badge",
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
		children: "Medium Badge",
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
		<div style={{ display: "flex", "flex-direction": "column", gap: "1rem" }}>
			<div style={{ display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
				<Badge variant="primary">Primary</Badge>
				<Badge variant="secondary">Secondary</Badge>
				<Badge variant="success">Success</Badge>
				<Badge variant="danger">Danger</Badge>
				<Badge variant="warning">Warning</Badge>
				<Badge variant="info">Info</Badge>
			</div>
			<div style={{ display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
				<Badge variant="outline" as="button">
					+ Add tag
				</Badge>
				<Badge variant="subtle">npm</Badge>
			</div>
			<div
				style={{
					display: "flex",
					gap: "0.5rem",
					"align-items": "center",
				}}
			>
				<Badge size="sm">Small</Badge>
				<Badge size="md">Medium</Badge>
			</div>
		</div>
	),
};

const allVariantsThemed = createThemedStories({
	story: allVariantsBase,
	testMode: "both",
});

export const AllVariantsLight = allVariantsThemed.Light;
export const AllVariantsDark = allVariantsThemed.Dark;

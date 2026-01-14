import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { Button } from "./button";

const meta = {
	title: "UI/Button",
	component: Button,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: [
				"primary",
				"secondary",
				"alternate",
				"inverse",
				"info",
				"danger",
				"warning",
				"success",
				"outline",
				"ghost",
			],
			description: "Button color variant",
		},
		size: {
			control: "select",
			options: ["sm", "md", "lg", "xl"],
			description: "Button size",
		},
		disabled: {
			control: "boolean",
			description: "Disabled state",
		},
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Example: Using the helper for themed stories
const primaryBase: Story = {
	args: {
		variant: "primary",
		children: "Primary Button",
	},
};

const primaryThemed = createThemedStories({
	story: primaryBase,
	testMode: "both", // Test both light and dark modes
});

export const PrimaryLight = primaryThemed.Light;
export const PrimaryDark = primaryThemed.Dark;

const secondaryBase: Story = {
	args: {
		variant: "secondary",
		children: "Secondary Button",
	},
};

const secondaryThemed = createThemedStories({
	story: secondaryBase,
	testMode: "both",
});

export const SecondaryLight = secondaryThemed.Light;
export const SecondaryDark = secondaryThemed.Dark;

const alternateBase: Story = {
	args: {
		variant: "alternate",
		children: "Alternate Button",
	},
};

const alternateThemed = createThemedStories({
	story: alternateBase,
	testMode: "both",
});

export const AlternateLight = alternateThemed.Light;
export const AlternateDark = alternateThemed.Dark;

const inverseBase: Story = {
	args: {
		variant: "inverse",
		children: "Inverse Button",
	},
};

const inverseThemed = createThemedStories({
	story: inverseBase,
	testMode: "both",
});

export const InverseLight = inverseThemed.Light;
export const InverseDark = inverseThemed.Dark;

const infoBase: Story = {
	args: {
		variant: "info",
		children: "Info Button",
	},
};

const infoThemed = createThemedStories({
	story: infoBase,
	testMode: "both",
});

export const InfoLight = infoThemed.Light;
export const InfoDark = infoThemed.Dark;

const dangerBase: Story = {
	args: {
		variant: "danger",
		children: "Danger Button",
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
		children: "Warning Button",
	},
};

const warningThemed = createThemedStories({
	story: warningBase,
	testMode: "both",
});

export const WarningLight = warningThemed.Light;
export const WarningDark = warningThemed.Dark;

const successBase: Story = {
	args: {
		variant: "success",
		children: "Success Button",
	},
};

const successThemed = createThemedStories({
	story: successBase,
	testMode: "both",
});

export const SuccessLight = successThemed.Light;
export const SuccessDark = successThemed.Dark;

const outlineBase: Story = {
	args: {
		variant: "outline",
		children: "Outline Button",
	},
};

const outlineThemed = createThemedStories({
	story: outlineBase,
	testMode: "both",
});

export const OutlineLight = outlineThemed.Light;
export const OutlineDark = outlineThemed.Dark;

const ghostBase: Story = {
	args: {
		variant: "ghost",
		children: "Ghost Button",
	},
};

const ghostThemed = createThemedStories({
	story: ghostBase,
	testMode: "both",
});

export const GhostLight = ghostThemed.Light;
export const GhostDark = ghostThemed.Dark;

const smallBase: Story = {
	args: {
		size: "sm",
		children: "Small Button",
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
		children: "Medium Button",
	},
};

const mediumThemed = createThemedStories({
	story: mediumBase,
	testMode: "both",
});

export const MediumLight = mediumThemed.Light;
export const MediumDark = mediumThemed.Dark;

const largeBase: Story = {
	args: {
		size: "lg",
		children: "Large Button",
	},
};

const largeThemed = createThemedStories({
	story: largeBase,
	testMode: "both",
});

export const LargeLight = largeThemed.Light;
export const LargeDark = largeThemed.Dark;

const extraLargeBase: Story = {
	args: {
		size: "xl",
		children: "Extra Large Button",
	},
};

const extraLargeThemed = createThemedStories({
	story: extraLargeBase,
	testMode: "both",
});

export const ExtraLargeLight = extraLargeThemed.Light;
export const ExtraLargeDark = extraLargeThemed.Dark;

const disabledBase: Story = {
	args: {
		disabled: true,
		children: "Disabled Button",
	},
};

const disabledThemed = createThemedStories({
	story: disabledBase,
	testMode: "both",
});

export const DisabledLight = disabledThemed.Light;
export const DisabledDark = disabledThemed.Dark;

const allVariantsBase: Story = {
	render: () => (
		<div style={{ display: "flex", "flex-direction": "column", gap: "1rem" }}>
			<div style={{ display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
				<Button variant="primary">Primary</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="alternate">Alternate</Button>
				<Button variant="inverse">Inverse</Button>
				<Button variant="info">Info</Button>
				<Button variant="danger">Danger</Button>
				<Button variant="warning">Warning</Button>
				<Button variant="success">Success</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="ghost">Ghost</Button>
			</div>
			<div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
				<Button size="sm">Small</Button>
				<Button size="md">Medium</Button>
				<Button size="lg">Large</Button>
				<Button size="xl">Extra Large</Button>
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

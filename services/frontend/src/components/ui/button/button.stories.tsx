import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { Button } from "./button";

const meta = {
	title: "UI/Button",
	component: Button,
	tags: ["autodocs"],
	includeStories: /^(?!.*Light|.*Dark).*$/, // Exclude stories ending with Light or Dark from sidebar
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

// This creates three stories: PrimaryLight (tested, hidden), PrimaryDark (hidden), Primary (visible, not tested)
const primaryThemed = createThemedStories({
	story: primaryBase,
	testMode: "light", // Only test light mode (default)
});

export const PrimaryLight = primaryThemed.Light;
export const PrimaryDark = primaryThemed.Dark;
export const Primary = primaryThemed.Playground;

export const Secondary: Story = {
	args: {
		variant: "secondary",
		children: "Secondary Button",
	},
};

export const Alternate: Story = {
	args: {
		variant: "alternate",
		children: "Alternate Button",
	},
};

export const Inverse: Story = {
	args: {
		variant: "inverse",
		children: "Inverse Button",
	},
};

export const Info: Story = {
	args: {
		variant: "info",
		children: "Info Button",
	},
};

export const Danger: Story = {
	args: {
		variant: "danger",
		children: "Danger Button",
	},
};

export const Warning: Story = {
	args: {
		variant: "warning",
		children: "Warning Button",
	},
};

export const Success: Story = {
	args: {
		variant: "success",
		children: "Success Button",
	},
};

export const Outline: Story = {
	args: {
		variant: "outline",
		children: "Outline Button",
	},
};

export const Small: Story = {
	args: {
		size: "sm",
		children: "Small Button",
	},
};

export const Medium: Story = {
	args: {
		size: "md",
		children: "Medium Button",
	},
};

export const Large: Story = {
	args: {
		size: "lg",
		children: "Large Button",
	},
};

export const ExtraLarge: Story = {
	args: {
		size: "xl",
		children: "Extra Large Button",
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
		children: "Disabled Button",
	},
};

export const AllVariants: Story = {
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

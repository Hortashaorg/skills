import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Badge } from "./badge";

const meta = {
	title: "UI/Badge",
	component: Badge,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["primary", "secondary", "success", "danger", "warning", "info"],
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

export const Primary: Story = {
	args: {
		variant: "primary",
		children: "Primary",
	},
};

export const Secondary: Story = {
	args: {
		variant: "secondary",
		children: "Secondary",
	},
};

export const Success: Story = {
	args: {
		variant: "success",
		children: "Success",
	},
};

export const Danger: Story = {
	args: {
		variant: "danger",
		children: "Danger",
	},
};

export const Warning: Story = {
	args: {
		variant: "warning",
		children: "Warning",
	},
};

export const Info: Story = {
	args: {
		variant: "info",
		children: "Info",
	},
};

export const Small: Story = {
	args: {
		size: "sm",
		children: "Small Badge",
	},
};

export const Medium: Story = {
	args: {
		size: "md",
		children: "Medium Badge",
	},
};

export const AllVariants: Story = {
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

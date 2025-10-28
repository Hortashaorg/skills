import { expect, fn, userEvent, within } from "@storybook/test";
import type { Meta, StoryObj } from "storybook-solidjs";
import type { ButtonProps } from "./button";
import { Button } from "./button";

type ButtonStoryArgs = ButtonProps<"button"> & {
	onClick?: () => void;
};

const meta = {
	title: "UI/Button",
	component: Button,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: [
				"default",
				"destructive",
				"outline",
				"secondary",
				"ghost",
				"link",
			],
			description: "The visual style variant of the button",
		},
		size: {
			control: "select",
			options: ["default", "sm", "lg", "icon"],
			description: "The size of the button",
		},
		disabled: {
			control: "boolean",
			description: "Whether the button is disabled",
		},
	},
	args: {
		onClick: fn(),
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: "Button",
		variant: "default",
	},
	play: async ({
		canvasElement,
		args,
	}: {
		canvasElement: HTMLElement;
		args: ButtonStoryArgs;
	}) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button", { name: "Button" });

		await expect(button).toBeInTheDocument();
		await expect(button).toBeEnabled();

		await userEvent.click(button);
		await expect(args.onClick).toHaveBeenCalledOnce();
	},
};

export const Destructive: Story = {
	args: {
		children: "Delete",
		variant: "destructive",
	},
	play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button");
		await expect(button).toHaveClass("bg-destructive");
	},
};

export const Outline: Story = {
	args: {
		children: "Outline",
		variant: "outline",
	},
	play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button");
		await expect(button).toHaveClass("border");
	},
};

export const Secondary: Story = {
	args: {
		children: "Secondary",
		variant: "secondary",
	},
};

export const Ghost: Story = {
	args: {
		children: "Ghost",
		variant: "ghost",
	},
};

export const Link: Story = {
	args: {
		children: "Link",
		variant: "link",
	},
};

export const Small: Story = {
	args: {
		children: "Small",
		size: "sm",
	},
	play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button");
		await expect(button).toHaveClass("h-9");
	},
};

export const Large: Story = {
	args: {
		children: "Large",
		size: "lg",
	},
	play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button");
		await expect(button).toHaveClass("h-11");
	},
};

export const Icon: Story = {
	args: {
		children: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<title>Check Icon</title>
				<path d="M20 6 9 17l-5-5" />
			</svg>
		),
		size: "icon",
		"aria-label": "Check",
	},
	play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button", { name: "Check" });
		await expect(button).toBeInTheDocument();
		await expect(button).toHaveClass("size-10");
	},
};

export const Disabled: Story = {
	args: {
		children: "Disabled",
		disabled: true,
	},
	play: async ({
		canvasElement,
		args,
	}: {
		canvasElement: HTMLElement;
		args: ButtonStoryArgs;
	}) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button");

		await expect(button).toBeDisabled();
		await expect(button).toHaveClass("disabled:opacity-50");

		await userEvent.click(button);
		await expect(args.onClick).not.toHaveBeenCalled();
	},
};

export const WithLoadingState: Story = {
	args: {
		children: (
			<>
				<svg
					class="animate-spin"
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<title>Loading</title>
					<path d="M21 12a9 9 0 1 1-6.219-8.56" />
				</svg>
				Loading...
			</>
		),
		disabled: true,
	},
};

export const AllVariants: Story = {
	render: () => (
		<div class="flex flex-col gap-4">
			<div class="flex flex-wrap gap-2">
				<Button variant="default">Default</Button>
				<Button variant="destructive">Destructive</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="ghost">Ghost</Button>
				<Button variant="link">Link</Button>
			</div>
			<div class="flex flex-wrap gap-2 items-center">
				<Button size="sm">Small</Button>
				<Button size="default">Default</Button>
				<Button size="lg">Large</Button>
				<Button size="icon">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<title>Icon</title>
						<path d="M20 6 9 17l-5-5" />
					</svg>
				</Button>
			</div>
		</div>
	),
};

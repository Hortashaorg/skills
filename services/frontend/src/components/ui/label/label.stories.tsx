import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Label } from "./label";

const meta = {
	title: "UI/Label",
	component: Label,
	tags: ["autodocs"],
	argTypes: {
		children: {
			control: "text",
			description: "Label text content",
		},
	},
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: "Email address",
	},
};

export const WithInput: Story = {
	render: () => (
		<div class="flex flex-col gap-2">
			<Label for="email">Email address</Label>
			<input
				id="email"
				type="email"
				placeholder="you@example.com"
				class="border border-outline dark:border-outline-dark rounded-radius px-3 py-2"
			/>
		</div>
	),
};

export const WithDisabledInput: Story = {
	render: () => (
		<div class="flex flex-col gap-2">
			<Label for="disabled-email">Email address</Label>
			<input
				id="disabled-email"
				type="email"
				placeholder="you@example.com"
				disabled
				class="peer border border-outline dark:border-outline-dark rounded-radius px-3 py-2"
			/>
		</div>
	),
};

export const Required: Story = {
	render: () => (
		<div class="flex flex-col gap-2">
			<Label for="required-email">
				Email address <span class="text-danger">*</span>
			</Label>
			<input
				id="required-email"
				type="email"
				placeholder="you@example.com"
				required
				class="border border-outline dark:border-outline-dark rounded-radius px-3 py-2"
			/>
		</div>
	),
};

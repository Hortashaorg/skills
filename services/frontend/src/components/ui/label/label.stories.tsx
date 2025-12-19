import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
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

const defaultBase: Story = {
	args: {
		children: "Email address",
	},
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "both",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

const withInputBase: Story = {
	render: () => (
		<div class="flex flex-col gap-2">
			<Label for="email">Email address</Label>
			<input
				id="email"
				type="email"
				placeholder="you@example.com"
				class="border border-outline dark:border-outline-dark rounded-radius px-3 py-2 text-on-surface dark:text-on-surface-dark"
			/>
		</div>
	),
};

const withInputThemed = createThemedStories({
	story: withInputBase,
	testMode: "both",
});

export const WithInputLight = withInputThemed.Light;
export const WithInputDark = withInputThemed.Dark;

const withDisabledInputBase: Story = {
	render: () => (
		<div class="flex flex-col gap-2">
			<Label for="disabled-email">Email address</Label>
			<input
				id="disabled-email"
				type="email"
				placeholder="you@example.com"
				disabled
				class="peer border border-outline dark:border-outline-dark rounded-radius px-3 py-2 text-on-surface dark:text-on-surface-dark"
			/>
		</div>
	),
};

const withDisabledInputThemed = createThemedStories({
	story: withDisabledInputBase,
	testMode: "both",
});

export const WithDisabledInputLight = withDisabledInputThemed.Light;
export const WithDisabledInputDark = withDisabledInputThemed.Dark;

const requiredBase: Story = {
	render: () => (
		<div class="flex flex-col gap-2">
			<Label for="required-email">
				Email address <span class="text-danger dark:text-danger-dark">*</span>
			</Label>
			<input
				id="required-email"
				type="email"
				placeholder="you@example.com"
				required
				class="border border-outline dark:border-outline-dark rounded-radius px-3 py-2 text-on-surface dark:text-on-surface-dark"
			/>
		</div>
	),
};

const requiredThemed = createThemedStories({
	story: requiredBase,
	testMode: "both",
});

export const RequiredLight = requiredThemed.Light;
export const RequiredDark = requiredThemed.Dark;

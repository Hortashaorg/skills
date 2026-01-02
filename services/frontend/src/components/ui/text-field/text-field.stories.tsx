import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { TextField, TextFieldInput, TextFieldLabel } from "./text-field";

const meta = {
	title: "UI/TextField",
	component: TextField,
	tags: ["autodocs"],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultBase: Story = {
	render: () => (
		<TextField>
			<TextFieldLabel>Email</TextFieldLabel>
			<TextFieldInput type="email" placeholder="you@example.com" />
		</TextField>
	),
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "both",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

const passwordBase: Story = {
	render: () => (
		<TextField>
			<TextFieldLabel>Password</TextFieldLabel>
			<TextFieldInput type="password" placeholder="Enter your password" />
		</TextField>
	),
};

const passwordThemed = createThemedStories({
	story: passwordBase,
	testMode: "both",
});

export const PasswordLight = passwordThemed.Light;
export const PasswordDark = passwordThemed.Dark;

const numberInputBase: Story = {
	render: () => (
		<TextField>
			<TextFieldLabel>Age</TextFieldLabel>
			<TextFieldInput type="number" placeholder="Enter your age" />
		</TextField>
	),
};

const numberInputThemed = createThemedStories({
	story: numberInputBase,
	testMode: "both",
});

export const NumberInputLight = numberInputThemed.Light;
export const NumberInputDark = numberInputThemed.Dark;

const disabledBase: Story = {
	render: () => (
		<TextField disabled>
			<TextFieldLabel>Email</TextFieldLabel>
			<TextFieldInput type="email" placeholder="you@example.com" />
		</TextField>
	),
};

const disabledThemed = createThemedStories({
	story: disabledBase,
	testMode: "both",
});

export const DisabledLight = disabledThemed.Light;
export const DisabledDark = disabledThemed.Dark;

const requiredBase: Story = {
	render: () => (
		<TextField required>
			<TextFieldLabel>Email</TextFieldLabel>
			<TextFieldInput type="email" placeholder="you@example.com" />
		</TextField>
	),
};

const requiredThemed = createThemedStories({
	story: requiredBase,
	testMode: "both",
});

export const RequiredLight = requiredThemed.Light;
export const RequiredDark = requiredThemed.Dark;

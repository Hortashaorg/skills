import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import {
	TextField,
	TextFieldDescription,
	TextFieldErrorMessage,
	TextFieldInput,
	TextFieldLabel,
	TextFieldTextArea,
} from "./text-field";

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

const withDescriptionBase: Story = {
	render: () => (
		<TextField>
			<TextFieldLabel>Email</TextFieldLabel>
			<TextFieldDescription>
				We'll never share your email with anyone else.
			</TextFieldDescription>
			<TextFieldInput type="email" placeholder="you@example.com" />
		</TextField>
	),
};

const withDescriptionThemed = createThemedStories({
	story: withDescriptionBase,
	testMode: "both",
});

export const WithDescriptionLight = withDescriptionThemed.Light;
export const WithDescriptionDark = withDescriptionThemed.Dark;

const withErrorBase: Story = {
	render: () => (
		<TextField validationState="invalid">
			<TextFieldLabel>Email</TextFieldLabel>
			<TextFieldInput type="email" placeholder="you@example.com" />
			<TextFieldErrorMessage>
				Please enter a valid email address.
			</TextFieldErrorMessage>
		</TextField>
	),
};

const withErrorThemed = createThemedStories({
	story: withErrorBase,
	testMode: "both",
});

export const WithErrorLight = withErrorThemed.Light;
export const WithErrorDark = withErrorThemed.Dark;

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

const textAreaBase: Story = {
	render: () => (
		<TextField>
			<TextFieldLabel>Bio</TextFieldLabel>
			<TextFieldDescription>
				Tell us a little bit about yourself.
			</TextFieldDescription>
			<TextFieldTextArea placeholder="Enter your bio..." />
		</TextField>
	),
};

const textAreaThemed = createThemedStories({
	story: textAreaBase,
	testMode: "both",
});

export const TextAreaLight = textAreaThemed.Light;
export const TextAreaDark = textAreaThemed.Dark;

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
			<TextFieldDescription>This field is required.</TextFieldDescription>
		</TextField>
	),
};

const requiredThemed = createThemedStories({
	story: requiredBase,
	testMode: "both",
});

export const RequiredLight = requiredThemed.Light;
export const RequiredDark = requiredThemed.Dark;

const fullExampleBase: Story = {
	render: () => (
		<div class="flex flex-col gap-4 max-w-md">
			<TextField>
				<TextFieldLabel>Username</TextFieldLabel>
				<TextFieldDescription>
					Choose a unique username for your account.
				</TextFieldDescription>
				<TextFieldInput type="text" placeholder="johndoe" />
			</TextField>

			<TextField validationState="invalid">
				<TextFieldLabel>Email</TextFieldLabel>
				<TextFieldInput type="email" value="invalid-email" />
				<TextFieldErrorMessage>
					Please enter a valid email address.
				</TextFieldErrorMessage>
			</TextField>

			<TextField>
				<TextFieldLabel>Message</TextFieldLabel>
				<TextFieldTextArea placeholder="Write your message here..." rows={4} />
			</TextField>
		</div>
	),
};

const fullExampleThemed = createThemedStories({
	story: fullExampleBase,
	testMode: "both",
});

export const FullExampleLight = fullExampleThemed.Light;
export const FullExampleDark = fullExampleThemed.Dark;

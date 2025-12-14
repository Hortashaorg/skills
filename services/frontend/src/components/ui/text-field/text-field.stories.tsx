import type { Meta, StoryObj } from "storybook-solidjs-vite";
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

export const Default: Story = {
	render: () => (
		<TextField>
			<TextFieldLabel>Email</TextFieldLabel>
			<TextFieldInput type="email" placeholder="you@example.com" />
		</TextField>
	),
};

export const WithDescription: Story = {
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

export const WithError: Story = {
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

export const Password: Story = {
	render: () => (
		<TextField>
			<TextFieldLabel>Password</TextFieldLabel>
			<TextFieldInput type="password" placeholder="Enter your password" />
		</TextField>
	),
};

export const NumberInput: Story = {
	render: () => (
		<TextField>
			<TextFieldLabel>Age</TextFieldLabel>
			<TextFieldInput type="number" placeholder="Enter your age" />
		</TextField>
	),
};

export const TextArea: Story = {
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

export const Disabled: Story = {
	render: () => (
		<TextField disabled>
			<TextFieldLabel>Email</TextFieldLabel>
			<TextFieldInput type="email" placeholder="you@example.com" />
		</TextField>
	),
};

export const Required: Story = {
	render: () => (
		<TextField required>
			<TextFieldLabel>Email</TextFieldLabel>
			<TextFieldInput type="email" placeholder="you@example.com" />
			<TextFieldDescription>This field is required.</TextFieldDescription>
		</TextField>
	),
};

export const FullExample: Story = {
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

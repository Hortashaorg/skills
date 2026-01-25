import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Flex } from "@/components/primitives/flex";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { createThemedStories } from "@/components/story-helpers";
import { Button } from "@/components/ui/button";
import {
	TextField,
	TextFieldInput,
	TextFieldLabel,
} from "@/components/ui/text-field";
import { Dialog } from "./dialog";

const meta = {
	title: "UI/Dialog",
	component: Dialog,
	tags: ["autodocs"],
	argTypes: {
		title: {
			control: "text",
			description: "Dialog title",
		},
		description: {
			control: "text",
			description: "Optional description below the title",
		},
	},
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultBase: Story = {
	render: () => {
		const [open, setOpen] = createSignal(false);
		return (
			<>
				<Button variant="primary" onClick={() => setOpen(true)}>
					Open Dialog
				</Button>
				<Dialog
					open={open()}
					onOpenChange={setOpen}
					title="Dialog Title"
					description="This is a description that provides additional context for the dialog."
				>
					<Stack spacing="md">
						<Text>
							This is the dialog content area where you can add any content.
						</Text>
						<Flex gap="sm" justify="end">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setOpen(false)}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								size="sm"
								onClick={() => setOpen(false)}
							>
								Confirm
							</Button>
						</Flex>
					</Stack>
				</Dialog>
			</>
		);
	},
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "none",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

const withFormBase: Story = {
	render: () => {
		const [open, setOpen] = createSignal(false);
		return (
			<>
				<Button variant="primary" onClick={() => setOpen(true)}>
					Open Form Dialog
				</Button>
				<Dialog
					open={open()}
					onOpenChange={setOpen}
					title="Create New Item"
					description="Fill out the form below to create a new item."
				>
					<Stack spacing="md">
						<TextField>
							<TextFieldLabel>Name</TextFieldLabel>
							<TextFieldInput placeholder="Enter name" />
						</TextField>
						<TextField>
							<TextFieldLabel>Description</TextFieldLabel>
							<TextFieldInput placeholder="Enter description" />
						</TextField>
						<Flex gap="sm" justify="end">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setOpen(false)}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								size="sm"
								onClick={() => setOpen(false)}
							>
								Create
							</Button>
						</Flex>
					</Stack>
				</Dialog>
			</>
		);
	},
};

const withFormThemed = createThemedStories({
	story: withFormBase,
	testMode: "none",
});

export const WithFormLight = withFormThemed.Light;
export const WithFormDark = withFormThemed.Dark;

const noDescriptionBase: Story = {
	render: () => {
		const [open, setOpen] = createSignal(false);
		return (
			<>
				<Button variant="outline" onClick={() => setOpen(true)}>
					Simple Dialog
				</Button>
				<Dialog open={open()} onOpenChange={setOpen} title="Simple Dialog">
					<Stack spacing="md">
						<Text>A dialog without a description, just title and content.</Text>
						<Flex gap="sm" justify="end">
							<Button
								variant="primary"
								size="sm"
								onClick={() => setOpen(false)}
							>
								Close
							</Button>
						</Flex>
					</Stack>
				</Dialog>
			</>
		);
	},
};

const noDescriptionThemed = createThemedStories({
	story: noDescriptionBase,
	testMode: "none",
});

export const NoDescriptionLight = noDescriptionThemed.Light;
export const NoDescriptionDark = noDescriptionThemed.Dark;

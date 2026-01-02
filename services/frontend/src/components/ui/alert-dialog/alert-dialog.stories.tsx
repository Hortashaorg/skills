import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { Button } from "@/components/ui/button";
import { AlertDialog } from "./alert-dialog";

const meta = {
	title: "UI/AlertDialog",
	component: AlertDialog,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["default", "danger"],
			description: "Visual variant - affects confirm button color",
		},
		title: {
			control: "text",
			description: "Dialog title",
		},
		description: {
			control: "text",
			description: "Dialog description/message",
		},
		confirmText: {
			control: "text",
			description: "Confirm button text",
		},
		cancelText: {
			control: "text",
			description: "Cancel button text",
		},
	},
} satisfies Meta<typeof AlertDialog>;

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
				<AlertDialog
					open={open()}
					onOpenChange={setOpen}
					title="Confirm Action"
					description="Are you sure you want to proceed with this action?"
					confirmText="Confirm"
					cancelText="Cancel"
					onConfirm={() => console.log("Confirmed")}
					onCancel={() => console.log("Cancelled")}
				/>
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

const dangerBase: Story = {
	render: () => {
		const [open, setOpen] = createSignal(false);
		return (
			<>
				<Button variant="danger" onClick={() => setOpen(true)}>
					Delete Item
				</Button>
				<AlertDialog
					open={open()}
					onOpenChange={setOpen}
					title="Delete Item"
					description="This action cannot be undone. Are you sure you want to delete this item?"
					confirmText="Delete"
					cancelText="Cancel"
					variant="danger"
					onConfirm={() => console.log("Deleted")}
					onCancel={() => console.log("Cancelled")}
				/>
			</>
		);
	},
};

const dangerThemed = createThemedStories({
	story: dangerBase,
	testMode: "none",
});

export const DangerLight = dangerThemed.Light;
export const DangerDark = dangerThemed.Dark;

const allVariantsBase: Story = {
	render: () => {
		const [defaultOpen, setDefaultOpen] = createSignal(false);
		const [dangerOpen, setDangerOpen] = createSignal(false);
		return (
			<div style={{ display: "flex", gap: "1rem" }}>
				<Button variant="primary" onClick={() => setDefaultOpen(true)}>
					Default
				</Button>
				<AlertDialog
					open={defaultOpen()}
					onOpenChange={setDefaultOpen}
					title="Confirm Action"
					description="This is a default confirmation dialog."
					confirmText="Confirm"
				/>
				<Button variant="danger" onClick={() => setDangerOpen(true)}>
					Danger
				</Button>
				<AlertDialog
					open={dangerOpen()}
					onOpenChange={setDangerOpen}
					title="Delete Item"
					description="This is a danger confirmation dialog."
					confirmText="Delete"
					variant="danger"
				/>
			</div>
		);
	},
};

const allVariantsThemed = createThemedStories({
	story: allVariantsBase,
	testMode: "none",
});

export const AllVariantsLight = allVariantsThemed.Light;
export const AllVariantsDark = allVariantsThemed.Dark;

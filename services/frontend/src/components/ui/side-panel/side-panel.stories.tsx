import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { createThemedStories } from "@/components/story-helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidePanel } from "./side-panel";

const meta = {
	title: "UI/SidePanel",
	component: SidePanel,
	tags: ["autodocs"],
	argTypes: {
		side: {
			control: "select",
			options: ["left", "right"],
			description: "Which edge the panel slides in from",
		},
		open: {
			control: "boolean",
			description: "Whether the panel is visible",
		},
		title: {
			control: "text",
			description: "Panel heading",
		},
	},
} satisfies Meta<typeof SidePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Right side (default)
const rightBase: Story = {
	render: () => {
		const [open, setOpen] = createSignal(false);
		return (
			<div>
				<Button onClick={() => setOpen(true)}>Open Right Panel</Button>
				<SidePanel open={open()} onClose={() => setOpen(false)} title="Details">
					<Stack spacing="md">
						<Text>Panel content goes here.</Text>
						<Text color="muted" size="sm">
							Press Escape or click the X to close.
						</Text>
					</Stack>
				</SidePanel>
			</div>
		);
	},
};

const rightThemed = createThemedStories({
	story: rightBase,
	testMode: "none",
});

export const RightLight = rightThemed.Light;
export const RightDark = rightThemed.Dark;

// Left side
const leftBase: Story = {
	render: () => {
		const [open, setOpen] = createSignal(false);
		return (
			<div>
				<Button onClick={() => setOpen(true)}>Open Left Panel</Button>
				<SidePanel
					open={open()}
					onClose={() => setOpen(false)}
					title="Navigation"
					side="left"
				>
					<Stack spacing="md">
						<Text>Left panel content.</Text>
					</Stack>
				</SidePanel>
			</div>
		);
	},
};

const leftThemed = createThemedStories({
	story: leftBase,
	testMode: "none",
});

export const LeftLight = leftThemed.Light;
export const LeftDark = leftThemed.Dark;

// With rich content
const richContentBase: Story = {
	render: () => {
		const [open, setOpen] = createSignal(false);
		return (
			<div>
				<Button onClick={() => setOpen(true)}>Open Panel</Button>
				<SidePanel
					open={open()}
					onClose={() => setOpen(false)}
					title="Package Details"
				>
					<Stack spacing="lg">
						<div>
							<Text weight="semibold" size="sm" class="mb-2">
								Status
							</Text>
							<Badge variant="success">Using</Badge>
						</div>
						<div>
							<Text weight="semibold" size="sm" class="mb-2">
								Description
							</Text>
							<Text size="sm" color="muted">
								A lightweight, performant TypeScript ORM with SQL-like syntax.
							</Text>
						</div>
						<div>
							<Text weight="semibold" size="sm" class="mb-2">
								Tags
							</Text>
							<div class="flex gap-1 flex-wrap">
								<Badge variant="subtle" size="sm">
									orm
								</Badge>
								<Badge variant="subtle" size="sm">
									database
								</Badge>
								<Badge variant="subtle" size="sm">
									typescript
								</Badge>
							</div>
						</div>
					</Stack>
				</SidePanel>
			</div>
		);
	},
};

const richContentThemed = createThemedStories({
	story: richContentBase,
	testMode: "none",
});

export const RichContentLight = richContentThemed.Light;
export const RichContentDark = richContentThemed.Dark;

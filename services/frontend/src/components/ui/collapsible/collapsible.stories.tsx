import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { Collapsible, type CollapsibleRootProps } from "./collapsible";

const meta = {
	title: "UI/Collapsible",
	component: Collapsible.Root,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["default", "compact"],
			description: "Size variant",
		},
		defaultOpen: {
			control: "boolean",
			description: "Whether the collapsible is open by default",
		},
	},
} satisfies Meta<typeof Collapsible.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default variant
const defaultBase: Story = {
	render: (props: CollapsibleRootProps) => (
		<Collapsible.Root {...props}>
			<Collapsible.Trigger>Section Title</Collapsible.Trigger>
			<Collapsible.Content>
				<p>
					This is the collapsible content. It can contain any elements like
					text, lists, or other components.
				</p>
			</Collapsible.Content>
		</Collapsible.Root>
	),
	args: {
		defaultOpen: false,
	},
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "both",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

// Default open variant
const defaultOpenBase: Story = {
	render: (props: CollapsibleRootProps) => (
		<Collapsible.Root {...props}>
			<Collapsible.Trigger>Open by Default</Collapsible.Trigger>
			<Collapsible.Content>
				<p>This section is open by default when the page loads.</p>
			</Collapsible.Content>
		</Collapsible.Root>
	),
	args: {
		defaultOpen: true,
	},
};

const defaultOpenThemed = createThemedStories({
	story: defaultOpenBase,
	testMode: "light",
});

export const DefaultOpenLight = defaultOpenThemed.Light;
export const DefaultOpenDark = defaultOpenThemed.Dark;

// Compact variant
const compactBase: Story = {
	render: (props: CollapsibleRootProps) => (
		<Collapsible.Root {...props}>
			<Collapsible.Trigger size="compact">Compact Section</Collapsible.Trigger>
			<Collapsible.Content size="compact">
				<p>Compact sizing for dense layouts like stats pages.</p>
			</Collapsible.Content>
		</Collapsible.Root>
	),
	args: {
		defaultOpen: true,
	},
};

const compactThemed = createThemedStories({
	story: compactBase,
	testMode: "both",
});

export const CompactLight = compactThemed.Light;
export const CompactDark = compactThemed.Dark;

// Multiple collapsibles
const multipleBase: Story = {
	render: () => (
		<div class="space-y-2">
			<Collapsible.Root defaultOpen>
				<Collapsible.Trigger size="compact">Tags (3)</Collapsible.Trigger>
				<Collapsible.Content size="compact">
					<div class="flex gap-1">
						<span class="px-2 py-0.5 bg-surface-alt dark:bg-surface-dark-alt rounded text-xs">
							react
						</span>
						<span class="px-2 py-0.5 bg-surface-alt dark:bg-surface-dark-alt rounded text-xs">
							typescript
						</span>
						<span class="px-2 py-0.5 bg-surface-alt dark:bg-surface-dark-alt rounded text-xs">
							ui
						</span>
					</div>
				</Collapsible.Content>
			</Collapsible.Root>
			<Collapsible.Root>
				<Collapsible.Trigger size="compact">
					Dependencies (12)
				</Collapsible.Trigger>
				<Collapsible.Content size="compact">
					<ul class="text-xs space-y-0.5">
						<li>react ^18.0.0</li>
						<li>typescript ^5.0.0</li>
						<li>vite ^5.0.0</li>
					</ul>
				</Collapsible.Content>
			</Collapsible.Root>
			<Collapsible.Root>
				<Collapsible.Trigger size="compact">
					Fetch History (5)
				</Collapsible.Trigger>
				<Collapsible.Content size="compact">
					<ul class="text-xs space-y-0.5">
						<li>2024-01-15 - Success</li>
						<li>2024-01-14 - Success</li>
						<li>2024-01-13 - Failed</li>
					</ul>
				</Collapsible.Content>
			</Collapsible.Root>
		</div>
	),
};

const multipleThemed = createThemedStories({
	story: multipleBase,
	testMode: "light",
});

export const MultipleLight = multipleThemed.Light;
export const MultipleDark = multipleThemed.Dark;

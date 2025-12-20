import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { Tabs } from "./tabs";

const meta = {
	title: "UI/Tabs",
	component: Tabs.Root,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["line", "pills"],
			description: "Tab styling variant",
		},
	},
} satisfies Meta<typeof Tabs.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

// Line variant (default)
const lineBase: Story = {
	render: () => (
		<Tabs.Root defaultValue="tab1">
			<Tabs.List variant="line">
				<Tabs.Trigger value="tab1" variant="line">
					Account
				</Tabs.Trigger>
				<Tabs.Trigger value="tab2" variant="line">
					Password
				</Tabs.Trigger>
				<Tabs.Trigger value="tab3" variant="line">
					Settings
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="tab1">
				<p class="text-on-surface dark:text-on-surface-dark">
					Account settings content goes here.
				</p>
			</Tabs.Content>
			<Tabs.Content value="tab2">
				<p class="text-on-surface dark:text-on-surface-dark">
					Password settings content goes here.
				</p>
			</Tabs.Content>
			<Tabs.Content value="tab3">
				<p class="text-on-surface dark:text-on-surface-dark">
					General settings content goes here.
				</p>
			</Tabs.Content>
		</Tabs.Root>
	),
};

const lineThemed = createThemedStories({
	story: lineBase,
	testMode: "both",
});

export const LineLight = lineThemed.Light;
export const LineDark = lineThemed.Dark;

// Pills variant
const pillsBase: Story = {
	render: () => (
		<Tabs.Root defaultValue="tab1">
			<Tabs.List variant="pills">
				<Tabs.Trigger value="tab1" variant="pills">
					Overview
				</Tabs.Trigger>
				<Tabs.Trigger value="tab2" variant="pills">
					Analytics
				</Tabs.Trigger>
				<Tabs.Trigger value="tab3" variant="pills">
					Reports
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="tab1">
				<p class="text-on-surface dark:text-on-surface-dark">
					Overview content goes here.
				</p>
			</Tabs.Content>
			<Tabs.Content value="tab2">
				<p class="text-on-surface dark:text-on-surface-dark">
					Analytics content goes here.
				</p>
			</Tabs.Content>
			<Tabs.Content value="tab3">
				<p class="text-on-surface dark:text-on-surface-dark">
					Reports content goes here.
				</p>
			</Tabs.Content>
		</Tabs.Root>
	),
};

const pillsThemed = createThemedStories({
	story: pillsBase,
	testMode: "both",
});

export const PillsLight = pillsThemed.Light;
export const PillsDark = pillsThemed.Dark;

// Small size
const smallBase: Story = {
	render: () => (
		<Tabs.Root defaultValue="tab1">
			<Tabs.List variant="line">
				<Tabs.Trigger value="tab1" variant="line" size="sm">
					Small Tab 1
				</Tabs.Trigger>
				<Tabs.Trigger value="tab2" variant="line" size="sm">
					Small Tab 2
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="tab1">
				<p class="text-on-surface dark:text-on-surface-dark text-sm">
					Small tab content.
				</p>
			</Tabs.Content>
			<Tabs.Content value="tab2">
				<p class="text-on-surface dark:text-on-surface-dark text-sm">
					Second small tab content.
				</p>
			</Tabs.Content>
		</Tabs.Root>
	),
};

const smallThemed = createThemedStories({
	story: smallBase,
	testMode: "both",
});

export const SmallLight = smallThemed.Light;
export const SmallDark = smallThemed.Dark;

// Disabled tab
const disabledBase: Story = {
	render: () => (
		<Tabs.Root defaultValue="tab1">
			<Tabs.List variant="line">
				<Tabs.Trigger value="tab1" variant="line">
					Enabled
				</Tabs.Trigger>
				<Tabs.Trigger value="tab2" variant="line" disabled>
					Disabled
				</Tabs.Trigger>
				<Tabs.Trigger value="tab3" variant="line">
					Also Enabled
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="tab1">
				<p class="text-on-surface dark:text-on-surface-dark">First tab.</p>
			</Tabs.Content>
			<Tabs.Content value="tab2">
				<p class="text-on-surface dark:text-on-surface-dark">Disabled tab.</p>
			</Tabs.Content>
			<Tabs.Content value="tab3">
				<p class="text-on-surface dark:text-on-surface-dark">Third tab.</p>
			</Tabs.Content>
		</Tabs.Root>
	),
};

const disabledThemed = createThemedStories({
	story: disabledBase,
	testMode: "both",
});

export const DisabledLight = disabledThemed.Light;
export const DisabledDark = disabledThemed.Dark;

// All variants showcase
const allVariantsBase: Story = {
	render: () => (
		<div class="flex flex-col gap-8">
			<div>
				<p class="text-on-surface-muted dark:text-on-surface-dark-muted text-sm mb-2">
					Line variant:
				</p>
				<Tabs.Root defaultValue="tab1">
					<Tabs.List variant="line">
						<Tabs.Trigger value="tab1" variant="line">
							Tab 1
						</Tabs.Trigger>
						<Tabs.Trigger value="tab2" variant="line">
							Tab 2
						</Tabs.Trigger>
						<Tabs.Trigger value="tab3" variant="line">
							Tab 3
						</Tabs.Trigger>
					</Tabs.List>
				</Tabs.Root>
			</div>
			<div>
				<p class="text-on-surface-muted dark:text-on-surface-dark-muted text-sm mb-2">
					Pills variant:
				</p>
				<Tabs.Root defaultValue="tab1">
					<Tabs.List variant="pills">
						<Tabs.Trigger value="tab1" variant="pills">
							Tab 1
						</Tabs.Trigger>
						<Tabs.Trigger value="tab2" variant="pills">
							Tab 2
						</Tabs.Trigger>
						<Tabs.Trigger value="tab3" variant="pills">
							Tab 3
						</Tabs.Trigger>
					</Tabs.List>
				</Tabs.Root>
			</div>
		</div>
	),
};

const allVariantsThemed = createThemedStories({
	story: allVariantsBase,
	testMode: "light",
});

export const AllVariantsLight = allVariantsThemed.Light;
export const AllVariantsDark = allVariantsThemed.Dark;

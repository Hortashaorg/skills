import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { Select, type SelectOption } from "./select";

const meta = {
	title: "UI/Select",
	component: Select,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
			description: "Select size",
		},
	},
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const fruitOptions: SelectOption<string>[] = [
	{ value: "apple", label: "Apple" },
	{ value: "banana", label: "Banana" },
	{ value: "cherry", label: "Cherry" },
	{ value: "date", label: "Date" },
	{ value: "elderberry", label: "Elderberry" },
];

// Default select
const defaultBase: Story = {
	render: () => {
		const [value, setValue] = createSignal<string>();
		return (
			<div class="w-64">
				<Select
					options={fruitOptions}
					value={value()}
					onChange={setValue}
					placeholder="Select a fruit..."
				/>
			</div>
		);
	},
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "both",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

// With preselected value
const preselectedBase: Story = {
	render: () => {
		const [value, setValue] = createSignal<string>("banana");
		return (
			<div class="w-64">
				<Select
					options={fruitOptions}
					value={value()}
					onChange={setValue}
					placeholder="Select a fruit..."
				/>
			</div>
		);
	},
};

const preselectedThemed = createThemedStories({
	story: preselectedBase,
	testMode: "both",
});

export const PreselectedLight = preselectedThemed.Light;
export const PreselectedDark = preselectedThemed.Dark;

// Small size
const smallBase: Story = {
	render: () => {
		const [value, setValue] = createSignal<string>();
		return (
			<div class="w-48">
				<Select
					options={fruitOptions}
					value={value()}
					onChange={setValue}
					placeholder="Small select..."
					size="sm"
				/>
			</div>
		);
	},
};

const smallThemed = createThemedStories({
	story: smallBase,
	testMode: "both",
});

export const SmallLight = smallThemed.Light;
export const SmallDark = smallThemed.Dark;

// Large size
const largeBase: Story = {
	render: () => {
		const [value, setValue] = createSignal<string>();
		return (
			<div class="w-72">
				<Select
					options={fruitOptions}
					value={value()}
					onChange={setValue}
					placeholder="Large select..."
					size="lg"
				/>
			</div>
		);
	},
};

const largeThemed = createThemedStories({
	story: largeBase,
	testMode: "both",
});

export const LargeLight = largeThemed.Light;
export const LargeDark = largeThemed.Dark;

// Disabled select
const disabledBase: Story = {
	render: () => (
		<div class="w-64">
			<Select
				options={fruitOptions}
				placeholder="Disabled select..."
				disabled
			/>
		</div>
	),
};

const disabledThemed = createThemedStories({
	story: disabledBase,
	testMode: "both",
});

export const DisabledLight = disabledThemed.Light;
export const DisabledDark = disabledThemed.Dark;

// With disabled options
const disabledOptionsBase: Story = {
	render: () => {
		const [value, setValue] = createSignal<string>();
		const optionsWithDisabled: SelectOption<string>[] = [
			{ value: "apple", label: "Apple" },
			{ value: "banana", label: "Banana", disabled: true },
			{ value: "cherry", label: "Cherry" },
			{ value: "date", label: "Date", disabled: true },
			{ value: "elderberry", label: "Elderberry" },
		];
		return (
			<div class="w-64">
				<Select
					options={optionsWithDisabled}
					value={value()}
					onChange={setValue}
					placeholder="Some options disabled..."
				/>
			</div>
		);
	},
};

const disabledOptionsThemed = createThemedStories({
	story: disabledOptionsBase,
	testMode: "both",
});

export const DisabledOptionsLight = disabledOptionsThemed.Light;
export const DisabledOptionsDark = disabledOptionsThemed.Dark;

// All sizes showcase
const allSizesBase: Story = {
	render: () => (
		<div class="flex flex-col gap-4">
			<div>
				<p class="text-on-surface-muted dark:text-on-surface-dark-muted text-sm mb-2">
					Small:
				</p>
				<div class="w-48">
					<Select options={fruitOptions} placeholder="Small..." size="sm" />
				</div>
			</div>
			<div>
				<p class="text-on-surface-muted dark:text-on-surface-dark-muted text-sm mb-2">
					Medium (default):
				</p>
				<div class="w-56">
					<Select options={fruitOptions} placeholder="Medium..." size="md" />
				</div>
			</div>
			<div>
				<p class="text-on-surface-muted dark:text-on-surface-dark-muted text-sm mb-2">
					Large:
				</p>
				<div class="w-64">
					<Select options={fruitOptions} placeholder="Large..." size="lg" />
				</div>
			</div>
		</div>
	),
};

const allSizesThemed = createThemedStories({
	story: allSizesBase,
	testMode: "light",
});

export const AllSizesLight = allSizesThemed.Light;
export const AllSizesDark = allSizesThemed.Dark;

import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { EntityFilter, type FilterOption } from "./entity-filter";

const mockTagOptions: FilterOption[] = [
	{ value: "frontend", label: "Frontend", count: 42 },
	{ value: "backend", label: "Backend", count: 38 },
	{ value: "typescript", label: "TypeScript", count: 27 },
	{ value: "react", label: "React", count: 24 },
	{ value: "nodejs", label: "Node.js", count: 19 },
	{ value: "testing", label: "Testing", count: 12 },
];

const meta = {
	title: "Composite/EntityFilter",
	component: EntityFilter,
	tags: ["autodocs"],
	argTypes: {
		label: {
			control: "text",
			description: "Label for the filter trigger",
		},
		options: {
			control: "object",
			description: "Filter options with value, label, and count",
		},
		selectedSlugs: {
			control: "object",
			description: "Currently selected slugs",
		},
	},
} satisfies Meta<typeof EntityFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultBase: Story = {
	args: {
		options: mockTagOptions,
		selectedSlugs: [],
		onSelectionChange: (slugs: string[]) =>
			console.log("Selection changed:", slugs),
	},
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "both",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

const withSelectionsBase: Story = {
	args: {
		options: mockTagOptions,
		selectedSlugs: ["frontend", "typescript"],
		onSelectionChange: (slugs: string[]) =>
			console.log("Selection changed:", slugs),
	},
};

const withSelectionsThemed = createThemedStories({
	story: withSelectionsBase,
	testMode: "both",
});

export const WithSelectionsLight = withSelectionsThemed.Light;
export const WithSelectionsDark = withSelectionsThemed.Dark;

const customLabelBase: Story = {
	args: {
		label: "Categories",
		options: mockTagOptions,
		selectedSlugs: [],
		onSelectionChange: (slugs: string[]) =>
			console.log("Selection changed:", slugs),
	},
};

const customLabelThemed = createThemedStories({
	story: customLabelBase,
	testMode: "light",
});

export const CustomLabelLight = customLabelThemed.Light;
export const CustomLabelDark = customLabelThemed.Dark;

const emptyOptionsBase: Story = {
	args: {
		options: [],
		selectedSlugs: [],
		onSelectionChange: (slugs: string[]) =>
			console.log("Selection changed:", slugs),
	},
};

const emptyOptionsThemed = createThemedStories({
	story: emptyOptionsBase,
	testMode: "light",
});

export const EmptyOptionsLight = emptyOptionsThemed.Light;
export const EmptyOptionsDark = emptyOptionsThemed.Dark;

const interactiveBase: Story = {
	render: () => {
		const [selected, setSelected] = createSignal<string[]>([]);
		return (
			<div class="flex flex-col gap-4">
				<EntityFilter
					options={mockTagOptions}
					selectedSlugs={selected()}
					onSelectionChange={setSelected}
				/>
				<p class="text-sm text-on-surface dark:text-on-surface-dark">
					Selected: {selected().length > 0 ? selected().join(", ") : "None"}
				</p>
			</div>
		);
	},
};

const interactiveThemed = createThemedStories({
	story: interactiveBase,
	testMode: "light",
});

export const InteractiveLight = interactiveThemed.Light;
export const InteractiveDark = interactiveThemed.Dark;

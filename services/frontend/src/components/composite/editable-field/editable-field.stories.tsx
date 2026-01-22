import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { EditableField } from "./editable-field";

const meta = {
	title: "Composite/EditableField",
	component: EditableField,
	tags: ["autodocs"],
	argTypes: {
		disabled: {
			control: "boolean",
			description: "Disable editing (for anonymous users)",
		},
	},
} satisfies Meta<typeof EditableField>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultBase: Story = {
	args: {
		children: (
			<span class="text-on-surface dark:text-on-surface-dark">
				Editable content
			</span>
		),
		onEdit: () => console.log("Edit clicked"),
	},
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "both",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

const disabledBase: Story = {
	args: {
		children: (
			<span class="text-on-surface dark:text-on-surface-dark">
				Login to edit
			</span>
		),
		onEdit: () => console.log("Edit clicked"),
		disabled: true,
	},
};

const disabledThemed = createThemedStories({
	story: disabledBase,
	testMode: "both",
});

export const DisabledLight = disabledThemed.Light;
export const DisabledDark = disabledThemed.Dark;

const withHeadingBase: Story = {
	args: {
		children: (
			<h2 class="text-xl font-bold text-on-surface dark:text-on-surface-dark">
				Package Name
			</h2>
		),
		onEdit: () => console.log("Edit clicked"),
	},
};

const withHeadingThemed = createThemedStories({
	story: withHeadingBase,
	testMode: "light",
});

export const WithHeadingLight = withHeadingThemed.Light;
export const WithHeadingDark = withHeadingThemed.Dark;

const allVariantsBase: Story = {
	render: () => (
		<div style={{ display: "flex", "flex-direction": "column", gap: "1rem" }}>
			<EditableField onEdit={() => console.log("Edit 1")}>
				<span class="text-on-surface dark:text-on-surface-dark">
					Simple text content
				</span>
			</EditableField>
			<EditableField onEdit={() => console.log("Edit 2")}>
				<h3 class="text-lg font-semibold text-on-surface dark:text-on-surface-dark">
					Heading content
				</h3>
			</EditableField>
			<EditableField onEdit={() => console.log("Edit 3")} disabled>
				<span class="text-on-surface dark:text-on-surface-dark">
					Disabled (anonymous user)
				</span>
			</EditableField>
		</div>
	),
};

const allVariantsThemed = createThemedStories({
	story: allVariantsBase,
	testMode: "light",
});

export const AllVariantsLight = allVariantsThemed.Light;
export const AllVariantsDark = allVariantsThemed.Dark;

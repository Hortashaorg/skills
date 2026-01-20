import type { Meta, StoryObj } from "storybook-solidjs-vite";
import {
	PackageIcon,
	PlusIcon,
	SearchIcon,
} from "@/components/primitives/icon";
import { createThemedStories } from "@/components/story-helpers";
import { ActionCard } from "./action-card";

const meta = {
	title: "Composite/ActionCard",
	component: ActionCard,
	tags: ["autodocs"],
	argTypes: {
		title: {
			control: "text",
			description: "Main title text",
		},
		description: {
			control: "text",
			description: "Optional description text",
		},
		disabled: {
			control: "boolean",
			description: "Whether the card is disabled",
		},
	},
} satisfies Meta<typeof ActionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default with Plus icon
const defaultBase: Story = {
	args: {
		icon: <PlusIcon size="sm" class="text-primary dark:text-primary-dark" />,
		title: "Suggest Package",
		description: "Add a package to this ecosystem",
		onClick: () => console.log("Clicked!"),
	},
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "both",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

// Without description
const noDescriptionBase: Story = {
	args: {
		icon: <PlusIcon size="sm" class="text-primary dark:text-primary-dark" />,
		title: "Add Item",
		onClick: () => console.log("Clicked!"),
	},
};

const noDescriptionThemed = createThemedStories({
	story: noDescriptionBase,
	testMode: "both",
});

export const NoDescriptionLight = noDescriptionThemed.Light;
export const NoDescriptionDark = noDescriptionThemed.Dark;

// Disabled state
const disabledBase: Story = {
	args: {
		icon: <PlusIcon size="sm" class="text-primary dark:text-primary-dark" />,
		title: "Suggest Package",
		description: "Sign in to suggest",
		onClick: () => console.log("Clicked!"),
		disabled: true,
	},
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
		<div
			style={{
				display: "grid",
				gap: "1rem",
				"grid-template-columns": "repeat(2, 1fr)",
			}}
		>
			<ActionCard
				icon={
					<PlusIcon size="sm" class="text-primary dark:text-primary-dark" />
				}
				title="Suggest Package"
				description="Add a package to this ecosystem"
				onClick={() => {}}
			/>
			<ActionCard
				icon={
					<SearchIcon size="sm" class="text-primary dark:text-primary-dark" />
				}
				title="Request Package"
				description="Request a new package"
				onClick={() => {}}
			/>
			<ActionCard
				icon={
					<PackageIcon size="sm" class="text-primary dark:text-primary-dark" />
				}
				title="Suggest Ecosystem"
				description="Propose a new ecosystem"
				onClick={() => {}}
			/>
			<ActionCard
				icon={
					<PlusIcon size="sm" class="text-primary dark:text-primary-dark" />
				}
				title="Disabled Card"
				description="This action is unavailable"
				onClick={() => {}}
				disabled
			/>
		</div>
	),
};

const allVariantsThemed = createThemedStories({
	story: allVariantsBase,
	testMode: "light",
});

export const AllVariantsLight = allVariantsThemed.Light;
export const AllVariantsDark = allVariantsThemed.Dark;

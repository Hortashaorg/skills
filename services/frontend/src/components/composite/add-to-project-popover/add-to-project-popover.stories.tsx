import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { AddToProjectPopover, type Project } from "./add-to-project-popover";

const meta: Meta<typeof AddToProjectPopover> = {
	title: "Composite/AddToProjectPopover",
	component: AddToProjectPopover,
	parameters: {
		layout: "centered",
	},
};

export default meta;
type Story = StoryObj<typeof AddToProjectPopover>;

const mockProjects: Project[] = [
	{ id: "1", name: "My Frontend Stack" },
	{ id: "2", name: "Backend Tools" },
	{ id: "3", name: "Testing Libraries" },
];

const defaultBase: Story = {
	args: {
		projects: mockProjects,
		isInProject: () => false,
		onAdd: () => {},
		addingToProjectId: null,
	},
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "both",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

const withExistingBase: Story = {
	args: {
		projects: mockProjects,
		isInProject: (id: string) => id === "1",
		onAdd: () => {},
		addingToProjectId: null,
	},
};

const withExistingThemed = createThemedStories({
	story: withExistingBase,
	testMode: "both",
});

export const WithExistingLight = withExistingThemed.Light;
export const WithExistingDark = withExistingThemed.Dark;

const addingBase: Story = {
	args: {
		projects: mockProjects,
		isInProject: () => false,
		onAdd: () => {},
		addingToProjectId: "2",
	},
};

const addingThemed = createThemedStories({
	story: addingBase,
	testMode: "both",
});

export const AddingLight = addingThemed.Light;
export const AddingDark = addingThemed.Dark;

const noProjectsBase: Story = {
	args: {
		projects: [],
		isInProject: () => false,
		onAdd: () => {},
		addingToProjectId: null,
	},
};

const noProjectsThemed = createThemedStories({
	story: noProjectsBase,
	testMode: "both",
});

export const NoProjectsLight = noProjectsThemed.Light;
export const NoProjectsDark = noProjectsThemed.Dark;

import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { Heading } from "./heading";

const meta = {
	title: "Primitives/Heading",
	component: Heading,
	tags: ["autodocs"],
	argTypes: {
		as: {
			control: "select",
			options: ["h1", "h2", "h3", "h4", "h5", "h6"],
			description: "HTML heading element",
		},
		level: {
			control: "select",
			options: ["h1", "h2", "h3", "h4", "h5", "h6"],
			description: "Visual styling level (can differ from semantic element)",
		},
		color: {
			control: "select",
			options: ["default", "primary", "muted"],
			description: "Text color",
		},
	},
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

const h1Base: Story = {
	args: {
		level: "h1",
		children: "Heading 1",
	},
};

const h1Themed = createThemedStories({
	story: h1Base,
	testMode: "both",
});

export const H1Light = h1Themed.Light;
export const H1Dark = h1Themed.Dark;

const h2Base: Story = {
	args: {
		level: "h2",
		children: "Heading 2",
	},
};

const h2Themed = createThemedStories({
	story: h2Base,
	testMode: "both",
});

export const H2Light = h2Themed.Light;
export const H2Dark = h2Themed.Dark;

const h3Base: Story = {
	args: {
		level: "h3",
		children: "Heading 3",
	},
};

const h3Themed = createThemedStories({
	story: h3Base,
	testMode: "both",
});

export const H3Light = h3Themed.Light;
export const H3Dark = h3Themed.Dark;

const h4Base: Story = {
	args: {
		level: "h4",
		children: "Heading 4",
	},
};

const h4Themed = createThemedStories({
	story: h4Base,
	testMode: "both",
});

export const H4Light = h4Themed.Light;
export const H4Dark = h4Themed.Dark;

const h5Base: Story = {
	args: {
		level: "h5",
		children: "Heading 5",
	},
};

const h5Themed = createThemedStories({
	story: h5Base,
	testMode: "both",
});

export const H5Light = h5Themed.Light;
export const H5Dark = h5Themed.Dark;

const h6Base: Story = {
	args: {
		level: "h6",
		children: "Heading 6",
	},
};

const h6Themed = createThemedStories({
	story: h6Base,
	testMode: "both",
});

export const H6Light = h6Themed.Light;
export const H6Dark = h6Themed.Dark;

const allLevelsBase: Story = {
	render: () => (
		<div class="space-y-4">
			<Heading level="h1">Heading 1 (4xl → 5xl)</Heading>
			<Heading level="h2">Heading 2 (3xl → 4xl) - Default</Heading>
			<Heading level="h3">Heading 3 (2xl → 3xl)</Heading>
			<Heading level="h4">Heading 4 (xl → 2xl)</Heading>
			<Heading level="h5">Heading 5 (lg → xl)</Heading>
			<Heading level="h6">Heading 6 (base → lg)</Heading>
		</div>
	),
};

const allLevelsThemed = createThemedStories({
	story: allLevelsBase,
	testMode: "both",
});

export const AllLevelsLight = allLevelsThemed.Light;
export const AllLevelsDark = allLevelsThemed.Dark;

const colorsBase: Story = {
	render: () => (
		<div class="space-y-4">
			<Heading level="h2" color="default">
				Default color (on-surface-strong)
			</Heading>
			<Heading level="h2" color="primary">
				Primary color
			</Heading>
			<Heading level="h2" color="muted">
				Muted color (on-surface)
			</Heading>
		</div>
	),
};

const colorsThemed = createThemedStories({
	story: colorsBase,
	testMode: "both",
});

export const ColorsLight = colorsThemed.Light;
export const ColorsDark = colorsThemed.Dark;

const semanticVsVisualBase: Story = {
	render: () => (
		<div class="space-y-4">
			<div>
				<p class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted mb-2">
					Semantic h1, styled as h1
				</p>
				<Heading as="h1" level="h1">
					This is semantically h1
				</Heading>
			</div>
			<div>
				<p class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted mb-2">
					Semantic h2, styled as h1 (larger visual)
				</p>
				<Heading as="h2" level="h1">
					This is semantically h2, but looks like h1
				</Heading>
			</div>
			<div>
				<p class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted mb-2">
					Semantic h1, styled as h3 (smaller visual)
				</p>
				<Heading as="h1" level="h3">
					This is semantically h1, but looks like h3
				</Heading>
			</div>
		</div>
	),
};

const semanticVsVisualThemed = createThemedStories({
	story: semanticVsVisualBase,
	testMode: "both",
});

export const SemanticVsVisualLight = semanticVsVisualThemed.Light;
export const SemanticVsVisualDark = semanticVsVisualThemed.Dark;

const withCustomClassBase: Story = {
	render: () => (
		<Heading level="h2" class="italic" color="primary">
			Heading with custom class
		</Heading>
	),
};

const withCustomClassThemed = createThemedStories({
	story: withCustomClassBase,
	testMode: "both",
});

export const WithCustomClassLight = withCustomClassThemed.Light;
export const WithCustomClassDark = withCustomClassThemed.Dark;

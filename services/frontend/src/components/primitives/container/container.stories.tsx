import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { Container } from "./container";

const meta = {
	title: "Primitives/Container",
	component: Container,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md", "lg", "xl", "full"],
			description: "Maximum width of the container",
		},
	},
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

const DemoContent = () => (
	<div class="bg-surface-alt dark:bg-surface-dark-alt p-6 rounded-radius">
		<h2 class="text-2xl font-semibold mb-4 text-on-surface-strong dark:text-on-surface-dark-strong">
			Container Demo
		</h2>
		<p class="text-on-surface dark:text-on-surface-dark">
			This container has responsive padding and centers content with a maximum
			width. Try resizing the viewport to see the padding adjust at different
			breakpoints.
		</p>
	</div>
);

const smallBase: Story = {
	render: () => (
		<Container size="sm">
			<DemoContent />
		</Container>
	),
};

const smallThemed = createThemedStories({
	story: smallBase,
	testMode: "both",
});

export const SmallLight = smallThemed.Light;
export const SmallDark = smallThemed.Dark;

const mediumBase: Story = {
	render: () => (
		<Container size="md">
			<DemoContent />
		</Container>
	),
};

const mediumThemed = createThemedStories({
	story: mediumBase,
	testMode: "both",
});

export const MediumLight = mediumThemed.Light;
export const MediumDark = mediumThemed.Dark;

const largeBase: Story = {
	render: () => (
		<Container size="lg">
			<DemoContent />
		</Container>
	),
};

const largeThemed = createThemedStories({
	story: largeBase,
	testMode: "both",
});

export const LargeLight = largeThemed.Light;
export const LargeDark = largeThemed.Dark;

const extraLargeBase: Story = {
	render: () => (
		<Container size="xl">
			<DemoContent />
		</Container>
	),
};

const extraLargeThemed = createThemedStories({
	story: extraLargeBase,
	testMode: "both",
});

export const ExtraLargeLight = extraLargeThemed.Light;
export const ExtraLargeDark = extraLargeThemed.Dark;

const fullBase: Story = {
	render: () => (
		<Container size="full">
			<DemoContent />
		</Container>
	),
};

const fullThemed = createThemedStories({
	story: fullBase,
	testMode: "both",
});

export const FullLight = fullThemed.Light;
export const FullDark = fullThemed.Dark;

const allSizesBase: Story = {
	render: () => (
		<div class="space-y-8">
			<div>
				<p class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted mb-2">
					Small (max-w-3xl)
				</p>
				<Container size="sm">
					<DemoContent />
				</Container>
			</div>
			<div>
				<p class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted mb-2">
					Medium (max-w-5xl)
				</p>
				<Container size="md">
					<DemoContent />
				</Container>
			</div>
			<div>
				<p class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted mb-2">
					Large (max-w-7xl) - Default
				</p>
				<Container size="lg">
					<DemoContent />
				</Container>
			</div>
			<div>
				<p class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted mb-2">
					Extra Large (max-w-[1400px])
				</p>
				<Container size="xl">
					<DemoContent />
				</Container>
			</div>
			<div>
				<p class="text-sm text-on-surface-muted dark:text-on-surface-dark-muted mb-2">
					Full Width (max-w-full)
				</p>
				<Container size="full">
					<DemoContent />
				</Container>
			</div>
		</div>
	),
};

const allSizesThemed = createThemedStories({
	story: allSizesBase,
	testMode: "both",
});

export const AllSizesLight = allSizesThemed.Light;
export const AllSizesDark = allSizesThemed.Dark;

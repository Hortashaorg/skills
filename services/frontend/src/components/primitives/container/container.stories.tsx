import type { Meta, StoryObj } from "storybook-solidjs-vite";
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

export const Small: Story = {
	render: () => (
		<Container size="sm">
			<DemoContent />
		</Container>
	),
};

export const Medium: Story = {
	render: () => (
		<Container size="md">
			<DemoContent />
		</Container>
	),
};

export const Large: Story = {
	render: () => (
		<Container size="lg">
			<DemoContent />
		</Container>
	),
};

export const ExtraLarge: Story = {
	render: () => (
		<Container size="xl">
			<DemoContent />
		</Container>
	),
};

export const Full: Story = {
	render: () => (
		<Container size="full">
			<DemoContent />
		</Container>
	),
};

export const AllSizes: Story = {
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

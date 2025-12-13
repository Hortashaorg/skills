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
	args: {
		size: "sm",
		children: <DemoContent />,
	},
};

export const Medium: Story = {
	args: {
		size: "md",
		children: <DemoContent />,
	},
};

export const Large: Story = {
	args: {
		size: "lg",
		children: <DemoContent />,
	},
};

export const ExtraLarge: Story = {
	args: {
		size: "xl",
		children: <DemoContent />,
	},
};

export const Full: Story = {
	args: {
		size: "full",
		children: <DemoContent />,
	},
};

export const AllSizes: Story = {
	render: () => (
		<div class="space-y-8">
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					Small (max-w-3xl)
				</p>
				<Container size="sm">
					<DemoContent />
				</Container>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					Medium (max-w-5xl)
				</p>
				<Container size="md">
					<DemoContent />
				</Container>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					Large (max-w-7xl) - Default
				</p>
				<Container size="lg">
					<DemoContent />
				</Container>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					Extra Large (max-w-[1400px])
				</p>
				<Container size="xl">
					<DemoContent />
				</Container>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					Full Width (max-w-full)
				</p>
				<Container size="full">
					<DemoContent />
				</Container>
			</div>
		</div>
	),
};

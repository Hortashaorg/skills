import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Card } from "./card";

const meta = {
	title: "UI/Card",
	component: Card,
	tags: ["autodocs"],
	argTypes: {
		padding: {
			control: "select",
			options: ["none", "sm", "md", "lg"],
			description: "Card padding size",
		},
	},
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const DemoContent = () => (
	<div>
		<h3 class="text-lg font-semibold text-on-surface-strong dark:text-on-surface-dark-strong mb-2">
			Card Title
		</h3>
		<p class="text-sm text-on-surface dark:text-on-surface-dark">
			This is some example content inside a card component. Cards are used to
			group related content and actions.
		</p>
	</div>
);

export const Default: Story = {
	render: () => (
		<Card>
			<DemoContent />
		</Card>
	),
};

export const NoPadding: Story = {
	render: () => (
		<Card padding="none">
			<div class="p-4">
				<DemoContent />
			</div>
		</Card>
	),
};

export const SmallPadding: Story = {
	render: () => (
		<Card padding="sm">
			<DemoContent />
		</Card>
	),
};

export const MediumPadding: Story = {
	render: () => (
		<Card padding="md">
			<DemoContent />
		</Card>
	),
};

export const LargePadding: Story = {
	render: () => (
		<Card padding="lg">
			<DemoContent />
		</Card>
	),
};

export const AllPaddings: Story = {
	render: () => (
		<div class="space-y-4">
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					No padding (p-0)
				</p>
				<Card padding="none">
					<div class="p-4">
						<DemoContent />
					</div>
				</Card>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					Small padding (p-3)
				</p>
				<Card padding="sm">
					<DemoContent />
				</Card>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					Medium padding (p-4) - Default
				</p>
				<Card padding="md">
					<DemoContent />
				</Card>
			</div>
			<div>
				<p class="text-sm text-on-surface/70 dark:text-on-surface-dark/70 mb-2">
					Large padding (p-6)
				</p>
				<Card padding="lg">
					<DemoContent />
				</Card>
			</div>
		</div>
	),
};

export const WithCustomContent: Story = {
	render: () => (
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<Card>
				<div class="space-y-2">
					<div class="w-12 h-12 bg-primary dark:bg-primary-dark rounded-radius" />
					<h3 class="text-lg font-semibold text-on-surface-strong dark:text-on-surface-dark-strong">
						Feature Card
					</h3>
					<p class="text-sm text-on-surface dark:text-on-surface-dark">
						Description of this feature goes here.
					</p>
				</div>
			</Card>
			<Card>
				<div class="space-y-2">
					<div class="w-12 h-12 bg-secondary dark:bg-secondary-dark rounded-radius" />
					<h3 class="text-lg font-semibold text-on-surface-strong dark:text-on-surface-dark-strong">
						Another Feature
					</h3>
					<p class="text-sm text-on-surface dark:text-on-surface-dark">
						More information about features.
					</p>
				</div>
			</Card>
		</div>
	),
};

export const NestedCards: Story = {
	render: () => (
		<Card padding="lg">
			<h2 class="text-xl font-semibold text-on-surface-strong dark:text-on-surface-dark-strong mb-4">
				Parent Card
			</h2>
			<div class="space-y-3">
				<Card padding="sm">
					<p class="text-sm text-on-surface dark:text-on-surface-dark">
						Nested Card 1
					</p>
				</Card>
				<Card padding="sm">
					<p class="text-sm text-on-surface dark:text-on-surface-dark">
						Nested Card 2
					</p>
				</Card>
			</div>
		</Card>
	),
};

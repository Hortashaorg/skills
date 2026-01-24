import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createThemedStories } from "@/components/story-helpers";
import { SkeletonCard } from "./skeleton-card";

const meta = {
	title: "UI/SkeletonCard",
	component: SkeletonCard,
	tags: ["autodocs"],
} satisfies Meta<typeof SkeletonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultBase: Story = {
	render: () => (
		<div style={{ width: "300px" }}>
			<SkeletonCard />
		</div>
	),
};

const defaultThemed = createThemedStories({
	story: defaultBase,
	testMode: "none",
});

export const DefaultLight = defaultThemed.Light;
export const DefaultDark = defaultThemed.Dark;

const gridBase: Story = {
	render: () => (
		<div
			style={{
				display: "grid",
				"grid-template-columns": "repeat(3, 1fr)",
				gap: "1rem",
			}}
		>
			<SkeletonCard />
			<SkeletonCard />
			<SkeletonCard />
			<SkeletonCard />
			<SkeletonCard />
			<SkeletonCard />
		</div>
	),
};

const gridThemed = createThemedStories({
	story: gridBase,
	testMode: "none",
});

export const GridLight = gridThemed.Light;
export const GridDark = gridThemed.Dark;

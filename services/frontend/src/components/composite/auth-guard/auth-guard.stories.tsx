import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Text } from "@/components/primitives/text";
import { createThemedStories } from "@/components/story-helpers";
import { AuthGuard } from "./auth-guard";

const meta = {
	title: "Composite/AuthGuard",
	component: AuthGuard,
	tags: ["autodocs"],
	argTypes: {
		hasAccess: {
			control: "boolean",
			description: "Whether the user has access",
		},
	},
} satisfies Meta<typeof AuthGuard>;

export default meta;
type Story = StoryObj<typeof meta>;

const hasAccessBase: Story = {
	args: {
		hasAccess: true,
		children: (
			<div class="p-4 bg-success/10 dark:bg-success-dark/10 rounded-md">
				<Text>Protected content is visible</Text>
			</div>
		),
	},
};

const hasAccessThemed = createThemedStories({
	story: hasAccessBase,
	testMode: "both",
});

export const HasAccessLight = hasAccessThemed.Light;
export const HasAccessDark = hasAccessThemed.Dark;

const noAccessBase: Story = {
	args: {
		hasAccess: false,
		children: <div>This should not be visible</div>,
	},
};

const noAccessThemed = createThemedStories({
	story: noAccessBase,
	testMode: "both",
});

export const NoAccessLight = noAccessThemed.Light;
export const NoAccessDark = noAccessThemed.Dark;

const withFallbackBase: Story = {
	args: {
		hasAccess: false,
		fallback: <Text color="muted">You don't have access to this content.</Text>,
		children: <div>This should not be visible</div>,
	},
};

const withFallbackThemed = createThemedStories({
	story: withFallbackBase,
	testMode: "both",
});

export const WithFallbackLight = withFallbackThemed.Light;
export const WithFallbackDark = withFallbackThemed.Dark;

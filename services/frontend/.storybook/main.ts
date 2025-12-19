import type { StorybookConfig } from "storybook-solidjs-vite";

const config: StorybookConfig = {
	addons: [
		"@chromatic-com/storybook",
		"@storybook/addon-vitest",
		"@storybook/addon-a11y",
		"@storybook/addon-docs",
		"@storybook/addon-onboarding",
		"@storybook/addon-links",
	],
	framework: "storybook-solidjs-vite",
	stories: ["../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
	tags: {
		"test-only": {
			defaultFilterSelection: "exclude", // Hide from sidebar by default
		},
	},
};
export default config;

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
};
export default config;

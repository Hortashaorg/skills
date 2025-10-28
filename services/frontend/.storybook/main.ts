import { defineMain } from "storybook-solidjs-vite";

export default defineMain({
	framework: {
		name: "storybook-solidjs-vite",
		options: {},
	},
	addons: [
		"@storybook/addon-onboarding",
		"@storybook/addon-docs",
		"@storybook/addon-a11y",
		"@storybook/addon-links",
		"@storybook/addon-vitest",
	],
	stories: [
		"../stories/**/*.mdx",
		"../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
	],
});

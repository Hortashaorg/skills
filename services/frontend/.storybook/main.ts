import { resolve } from "node:path";
import type { StorybookConfig } from "storybook-solidjs";

const config: StorybookConfig = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
	addons: [
		"@storybook/addon-essentials",
		"@storybook/addon-interactions",
		"@storybook/addon-a11y",
	],
	framework: {
		name: "storybook-solidjs",
		options: {},
	},
	core: {
		builder: "@storybook/builder-vite",
	},
	async viteFinal(config) {
		if (config.resolve) {
			config.resolve.alias = {
				...config.resolve.alias,
				"@": resolve(__dirname, "../src"),
			};
		}
		return config;
	},
};

export default config;

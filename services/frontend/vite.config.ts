/// <reference types="vitest" />
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

const dirname =
	typeof __dirname !== "undefined"
		? __dirname
		: path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
	plugins: [
		solidPlugin(),
		tailwindcss(),
		// Only load storybook plugin during testing
		mode === "test" &&
			storybookTest({
				configDir: path.join(dirname, ".storybook"),
			}),
	].filter(Boolean),
	server: {
		port: 4321,
	},
	build: {
		target: "esnext",
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@sb": path.resolve(__dirname, "./.storybook"),
		},
	},
	test: {
		browser: {
			enabled: true,
			headless: true,
			provider: playwright(),
			instances: [
				{
					browser: "chromium",
				},
			],
		},
		// Reduce parallelism to avoid resource exhaustion
		fileParallelism: false,
		isolate: false,
		setupFiles: ["./.storybook/vitest.setup.ts"],
		coverage: {
			exclude: [
				"**/*.stories.tsx",
				"src/components/decorators.tsx",
				"src/components/story-helpers.tsx",
				".storybook/**",
				"src/index.css",
				"**/index.ts",
			],
		},
	},
}));

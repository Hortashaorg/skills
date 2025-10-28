import type { TestRunnerConfig } from "@storybook/test-runner";

const config: TestRunnerConfig = {
	async preVisit(page) {
		await page.goto("about:blank");
	},
};

export default config;

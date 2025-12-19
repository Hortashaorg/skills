import type { StoryObj } from "storybook-solidjs-vite";

/**
 * Configuration for themed story variants
 */
export interface ThemedStoryConfig<T> {
	/** The base story configuration */
	story: StoryObj<T>;
	/** Whether to run tests (default: "both" - test both light and dark modes) */
	testMode?: "light" | "dark" | "both" | "none";
}

/**
 * Creates two story variants from a base story:
 * - Light mode - Visible in sidebar, tested
 * - Dark mode - Visible in sidebar, tested
 *
 * Users can toggle between light, dark, and side-by-side views using the
 * toolbar control in Storybook UI (default is side-by-side).
 *
 * @example
 * ```tsx
 * const baseStory: Story = {
 *   args: { children: "Click me" },
 *   play: async ({ canvasElement }) => {
 *     // interaction test
 *   }
 * };
 *
 * const themed = createThemedStories({
 *   story: baseStory,
 *   testMode: "both", // Test both themes (default)
 * });
 *
 * export const PrimaryLight = themed.Light;
 * export const PrimaryDark = themed.Dark;
 * ```
 */
export function createThemedStories<T>(config: ThemedStoryConfig<T>) {
	const { story, testMode = "both" } = config;

	// When testMode is "both", only run play function on Light to avoid conflicts
	// (interaction tests would run twice and cause "multiple elements" errors)
	const shouldRunPlayOnLight = testMode === "light" || testMode === "both";
	const shouldRunPlayOnDark = testMode === "dark";

	// Light mode story - visible and tested
	const Light: StoryObj<T> = {
		...story,
		parameters: {
			...story.parameters,
			theme: "light", // Custom parameter for decorator
		},
		tags: [
			...(story.tags || []),
			...(testMode === "light" || testMode === "both" ? [] : ["!test"]),
		],
		// Keep play function for Light when testing light or both
		play: shouldRunPlayOnLight ? story.play : undefined,
	};

	// Dark mode story - visible and tested
	const Dark: StoryObj<T> = {
		...story,
		parameters: {
			...story.parameters,
			theme: "dark", // Custom parameter for decorator
		},
		tags: [
			...(story.tags || []),
			...(testMode === "dark" || testMode === "both" ? [] : ["!test"]),
		],
		// Only keep play function for Dark when explicitly testing dark mode only
		play: shouldRunPlayOnDark ? story.play : undefined,
	};

	return { Light, Dark };
}

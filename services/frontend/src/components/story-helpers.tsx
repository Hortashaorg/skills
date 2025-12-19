import type { StoryObj } from "storybook-solidjs-vite";

/**
 * Configuration for themed story variants
 */
export interface ThemedStoryConfig<T> {
	/** The base story configuration */
	story: StoryObj<T>;
	/** Whether to run tests (default: "light" - only test light mode) */
	testMode?: "light" | "dark" | "both" | "none";
}

/**
 * Creates three story variants from a base story:
 * - Light mode (hidden in UI by default, available for testing)
 * - Dark mode (hidden in UI by default, available for testing)
 * - Side-by-side playground (visible in UI, excluded from tests)
 *
 * To hide Light/Dark stories from Storybook sidebar, export them with underscore prefix:
 * export const __MyStoryLight = themed.Light;  // Hidden from sidebar
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
 *   testMode: "light", // Only test light mode (default)
 * });
 *
 * // Export with __ prefix to hide from sidebar
 * export const __MyStoryLight = themed.Light;
 * export const __MyStoryDark = themed.Dark;
 * export const MyStory = themed.Playground;
 * ```
 */
export function createThemedStories<T>(config: ThemedStoryConfig<T>) {
	const { story, testMode = "light" } = config;

	// Light mode story - available for testing
	// Hidden from sidebar using 'test-only' tag
	const Light: StoryObj<T> = {
		...story,
		parameters: {
			...story.parameters,
			docs: { disable: true }, // Disable docs page
			globals: { themeMode: "light" },
		},
		tags: [
			...(story.tags || []),
			"!autodocs", // Hide from docs
			"test-only", // Mark as test-only (can be filtered in sidebar)
			...(testMode === "light" || testMode === "both" ? [] : ["!test"]),
		],
	};

	// Dark mode story - available for testing
	// Hidden from sidebar using 'test-only' tag
	const Dark: StoryObj<T> = {
		...story,
		parameters: {
			...story.parameters,
			docs: { disable: true }, // Disable docs page
			globals: { themeMode: "dark" },
		},
		tags: [
			...(story.tags || []),
			"!autodocs", // Hide from docs
			"test-only", // Mark as test-only (can be filtered in sidebar)
			...(testMode === "dark" || testMode === "both" ? [] : ["!test"]),
		],
	};

	// Playground story - visible in UI, excluded from tests
	const Playground: StoryObj<T> = {
		...story,
		parameters: {
			...story.parameters,
			globals: { themeMode: "side-by-side" }, // Force side-by-side mode
		},
		tags: [
			...(story.tags || []).filter((tag) => tag !== "autodocs"), // Keep other tags but ensure autodocs
			"!test", // Always exclude from tests (side-by-side breaks tests)
		],
		play: undefined, // Remove interaction tests from playground
	};

	return { Light, Dark, Playground };
}

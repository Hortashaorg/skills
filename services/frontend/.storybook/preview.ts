import type { Preview } from "storybook-solidjs-vite";
import { withTheme } from "../src/components/decorators";
import "../src/index.css";

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},

		a11y: {
			// 'todo' - show a11y violations in the test UI only
			// 'error' - fail CI on a11y violations
			// 'off' - skip a11y checks entirely
			test: "error",
		},

		// Test both light and dark modes
		backgrounds: {
			default: "light",
			values: [
				{ name: "light", value: "#ffffff" },
				{ name: "dark", value: "#1a1a1a" },
			],
		},
	},

	globalTypes: {
		theme: {
			description: "Global theme for components",
			toolbar: {
				title: "Theme",
				icon: "circlehollow",
				items: ["light", "dark"],
				dynamicTitle: true,
			},
		},
	},

	decorators: [withTheme],
};

export default preview;

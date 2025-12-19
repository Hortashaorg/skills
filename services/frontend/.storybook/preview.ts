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
	},

	globalTypes: {
		themeMode: {
			description: "Theme display mode",
			defaultValue: "side-by-side",
			toolbar: {
				title: "Theme",
				icon: "contrast",
				items: [
					{ value: "light", title: "Light", icon: "sun" },
					{ value: "dark", title: "Dark", icon: "moon" },
					{ value: "side-by-side", title: "Side by Side", icon: "sidebyside" },
				],
				dynamicTitle: true,
			},
		},
	},

	decorators: [withTheme],
};

export default preview;

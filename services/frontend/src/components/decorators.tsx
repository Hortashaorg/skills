import type { Decorator } from "storybook-solidjs-vite";

export const withTheme: Decorator = (Story, context) => {
	const theme = context.globals.theme || "light";
	const isDark = theme === "dark";

	return (
		<div
			class={isDark ? "dark" : ""}
			style={{
				"min-height": "100vh",
				"background-color": isDark ? "#1a1a1a" : "#ffffff",
				padding: "1rem",
			}}
		>
			<Story />
		</div>
	);
};

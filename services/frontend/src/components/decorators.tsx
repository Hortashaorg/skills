import type { Decorator } from "storybook-solidjs-vite";

export const withTheme: Decorator = (Story, context) => {
	const themeMode = context.globals.themeMode || "side-by-side";

	// Single dark mode
	if (themeMode === "dark") {
		return (
			<div
				class="dark"
				style={{
					"background-color": "#1a1a1a",
					padding: "2rem",
					"min-height": "100vh",
					display: "flex",
					"align-items": "center",
					"justify-content": "center",
				}}
			>
				<Story />
			</div>
		);
	}

	// Single light mode
	if (themeMode === "light") {
		return (
			<div
				style={{
					"background-color": "#ffffff",
					padding: "2rem",
					"min-height": "100vh",
					display: "flex",
					"align-items": "center",
					"justify-content": "center",
				}}
			>
				<Story />
			</div>
		);
	}

	// Side-by-side mode (default for visual browsing)
	return (
		<div
			style={{
				display: "flex",
				gap: "0",
				width: "100%",
				margin: "0",
				"min-height": "100vh",
			}}
		>
			<div
				class="dark"
				style={{
					flex: "1",
					"background-color": "#1a1a1a",
					padding: "2rem",
					display: "flex",
					"align-items": "center",
					"justify-content": "center",
				}}
			>
				<Story />
			</div>
			<div
				style={{
					flex: "1",
					"background-color": "#ffffff",
					padding: "2rem",
					display: "flex",
					"align-items": "center",
					"justify-content": "center",
				}}
			>
				<Story />
			</div>
		</div>
	);
};

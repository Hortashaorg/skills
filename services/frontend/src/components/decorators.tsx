import { MemoryRouter, Route } from "@solidjs/router";
import type { JSX } from "solid-js";
import type { Decorator } from "storybook-solidjs-vite";

const ThemeWrapper = (props: {
	mode: "light" | "dark" | "side-by-side";
	children: JSX.Element;
}) => {
	if (props.mode === "dark") {
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
				{props.children}
			</div>
		);
	}

	if (props.mode === "light") {
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
				{props.children}
			</div>
		);
	}

	// Side-by-side mode
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
				{props.children}
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
				{props.children}
			</div>
		</div>
	);
};

export const withTheme: Decorator = (Story, context) => {
	// Check for story-level theme parameter first, then fall back to global
	const themeMode =
		context.parameters.theme || context.globals.themeMode || "light";

	const mode =
		themeMode === "dark"
			? "dark"
			: themeMode === "light"
				? "light"
				: "side-by-side";

	return (
		<MemoryRouter>
			<Route
				path="*"
				component={() => (
					<ThemeWrapper mode={mode}>
						<Story />
					</ThemeWrapper>
				)}
			/>
		</MemoryRouter>
	);
};

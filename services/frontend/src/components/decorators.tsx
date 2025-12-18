import type { Decorator } from "storybook-solidjs-vite";

export const withTheme: Decorator = (Story) => {
	return (
		<>
			<div
				class={"dark"}
				style={{
					width: "100%",
					margin: 0,
					"background-color": "#1a1a1a",
					padding: "1rem",
				}}
			>
				<Story />
			</div>
			<div
				style={{
					"background-color": "#ffffff",
					padding: "1rem",
				}}
			>
				<Story />
			</div>
		</>
	);
};

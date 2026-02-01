import type { ToolbarModule } from "../toolbar-types";

const CodeIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<polyline points="16 18 22 12 16 6" />
		<polyline points="8 6 2 12 8 18" />
	</svg>
);

export const codeBlockModule: ToolbarModule = {
	id: "code-block",
	label: "Code block",
	icon: () => <CodeIcon />,
	action: (ctx) => {
		ctx.insert("\n```\n\n```\n");
	},
};

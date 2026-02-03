import { Icon } from "@/components/primitives/icon";
import type { ToolbarModule } from "../markdown-editor-types";

export const boldModule: ToolbarModule = {
	id: "bold",
	label: "Bold (Ctrl+B)",
	shortcut: { key: "b", ctrl: true },
	icon: () => (
		<Icon size="sm">
			<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
			<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
		</Icon>
	),
	action: (ctx) => ctx.wrap({ prefix: "**", suffix: "**" }),
};

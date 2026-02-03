import { Icon } from "@/components/primitives/icon";
import type { ToolbarModule } from "../markdown-editor-types";

export const undoModule: ToolbarModule = {
	id: "undo",
	label: "Undo (Ctrl+Z)",
	shortcut: { key: "z", ctrl: true },
	icon: () => (
		<Icon size="sm">
			<path d="M3 7v6h6" />
			<path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
		</Icon>
	),
	action: (ctx) => ctx.undo(),
};

export const redoModule: ToolbarModule = {
	id: "redo",
	label: "Redo (Ctrl+Y)",
	shortcut: [
		{ key: "y", ctrl: true },
		{ key: "z", ctrl: true, shift: true },
	],
	icon: () => (
		<Icon size="sm">
			<path d="M21 7v6h-6" />
			<path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
		</Icon>
	),
	action: (ctx) => ctx.redo(),
};

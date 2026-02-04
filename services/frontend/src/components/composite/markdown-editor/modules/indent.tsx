import { Icon } from "@/components/primitives/icon";
import type { ToolbarModule } from "../markdown-editor-types";

export const indentModule: ToolbarModule = {
	id: "indent",
	label: "Indent (Tab)",
	shortcut: { key: "Tab", ctrl: false },
	icon: () => (
		<Icon class="w-4 h-4 md:w-5 md:h-5">
			<polyline points="3 8 7 12 3 16" />
			<line x1="21" x2="11" y1="12" y2="12" />
			<line x1="21" x2="11" y1="6" y2="6" />
			<line x1="21" x2="11" y1="18" y2="18" />
		</Icon>
	),
	action: (ctx) => ctx.indent(),
};

export const outdentModule: ToolbarModule = {
	id: "outdent",
	label: "Outdent (Shift+Tab)",
	shortcut: { key: "Tab", ctrl: false, shift: true },
	icon: () => (
		<Icon class="w-4 h-4 md:w-5 md:h-5">
			<polyline points="7 8 3 12 7 16" />
			<line x1="21" x2="11" y1="12" y2="12" />
			<line x1="21" x2="11" y1="6" y2="6" />
			<line x1="21" x2="11" y1="18" y2="18" />
		</Icon>
	),
	action: (ctx) => ctx.outdent(),
};

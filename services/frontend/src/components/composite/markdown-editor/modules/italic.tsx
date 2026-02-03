import { Icon } from "@/components/primitives/icon";
import type { ToolbarModule } from "../markdown-editor-types";

export const italicModule: ToolbarModule = {
	id: "italic",
	label: "Italic (Ctrl+I)",
	shortcut: { key: "i", ctrl: true },
	icon: () => (
		<Icon class="w-4 h-4 md:w-5 md:h-5">
			<line x1="19" x2="10" y1="4" y2="4" />
			<line x1="14" x2="5" y1="20" y2="20" />
			<line x1="15" x2="9" y1="4" y2="20" />
		</Icon>
	),
	action: (ctx) => ctx.wrap({ prefix: "*", suffix: "*" }),
};

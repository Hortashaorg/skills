import { Icon } from "@/components/primitives/icon";
import type { ToolbarModule } from "../markdown-editor-types";

export const checklistModule: ToolbarModule = {
	id: "checklist",
	label: "Checklist",
	icon: () => (
		<Icon size="sm">
			<rect x="3" y="5" width="6" height="6" rx="1" />
			<path d="m3 17 2 2 4-4" />
			<path d="M13 6h8" />
			<path d="M13 12h8" />
			<path d="M13 18h8" />
		</Icon>
	),
	action: (ctx) => ctx.indent("- [ ] "),
};

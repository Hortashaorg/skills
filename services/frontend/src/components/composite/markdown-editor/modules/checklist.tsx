import { ChecklistIcon } from "@/components/primitives/icon";
import type { ToolbarModule } from "../markdown-editor-types";

export const checklistModule: ToolbarModule = {
	id: "checklist",
	label: "Checklist",
	icon: () => <ChecklistIcon class="w-4 h-4 md:w-5 md:h-5" />,
	action: (ctx) => ctx.indent("- [ ] "),
};

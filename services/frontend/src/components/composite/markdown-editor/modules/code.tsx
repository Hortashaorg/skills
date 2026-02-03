import { Icon } from "@/components/primitives/icon";
import type { ToolbarModule } from "../markdown-editor-types";

export const codeModule: ToolbarModule = {
	id: "code",
	label: "Code Block",
	icon: () => (
		<Icon class="w-4 h-4 md:w-5 md:h-5">
			<polyline points="16 18 22 12 16 6" />
			<polyline points="8 6 2 12 8 18" />
		</Icon>
	),
	action: (ctx) => ctx.insertBlock("```\n\n```"),
};

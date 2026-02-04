import { Icon } from "@/components/primitives/icon";
import type { ToolbarModule } from "../../markdown-editor-types";
import { EntityPanel } from "./entity-panel";

export const entitiesModule: ToolbarModule = {
	id: "entities",
	label: "Insert Reference",
	icon: () => (
		// At symbol icon - represents mentions/references
		<Icon class="w-4 h-4 md:w-5 md:h-5">
			<circle cx="12" cy="12" r="4" />
			<path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
		</Icon>
	),
	panel: (ctx) => <EntityPanel ctx={ctx} />,
};

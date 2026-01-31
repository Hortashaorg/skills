import { createSignal, For, Show } from "solid-js";
import type { InsertFn, ToolbarContext, ToolbarModule } from "./toolbar-types";

type ToolbarProps = {
	modules: ToolbarModule[];
	onInsert: InsertFn;
};

export const Toolbar = (props: ToolbarProps) => {
	const [activePanel, setActivePanel] = createSignal<string | null>(null);

	const createContext = (): ToolbarContext => ({
		insert: props.onInsert,
		closePanel: () => setActivePanel(null),
	});

	const handleClick = (module: ToolbarModule) => {
		if (module.panel) {
			setActivePanel(activePanel() === module.id ? null : module.id);
		} else if (module.action) {
			module.action(createContext());
		}
	};

	const activeModule = () =>
		props.modules.find((m) => m.id === activePanel() && m.panel);

	return (
		<div class="flex flex-col gap-3">
			<div
				class="inline-flex rounded-lg border border-outline dark:border-outline-dark overflow-hidden w-fit"
				role="toolbar"
			>
				<For each={props.modules}>
					{(module, index) => (
						<button
							type="button"
							onClick={() => handleClick(module)}
							class={`
								px-3 py-1.5 text-sm font-medium
								bg-surface dark:bg-surface-dark
								text-on-surface dark:text-on-surface-dark
								hover:bg-surface-alt dark:hover:bg-surface-dark-alt
								transition-colors
								${index() > 0 ? "border-l border-outline dark:border-outline-dark" : ""}
								${activePanel() === module.id ? "bg-surface-alt dark:bg-surface-dark-alt" : ""}
							`}
						>
							{module.icon && <span class="mr-1.5">{module.icon}</span>}
							{module.label}
						</button>
					)}
				</For>
			</div>

			<Show when={activeModule()}>
				{(module) => module().panel?.(createContext())}
			</Show>
		</div>
	);
};

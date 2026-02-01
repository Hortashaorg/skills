import { createSignal, For, Show } from "solid-js";
import { Button } from "@/components/ui/button";
import type { ToolbarContext, ToolbarModule } from "../toolbar";
import { MarkdownInput } from "./markdown-input";
import { MarkdownOutput } from "./markdown-output";

type MarkdownFieldProps = {
	value: string;
	onInput: (value: string) => void;
	onSubmit?: () => void;
	onCancel?: () => void;
	submitLabel?: string;
	modules?: ToolbarModule[];
	class?: string;
};

export const MarkdownField = (props: MarkdownFieldProps) => {
	let textareaRef: HTMLTextAreaElement | undefined;
	const [activeTab, setActiveTab] = createSignal<"write" | "preview">("write");
	const [activePanel, setActivePanel] = createSignal<string | null>(null);

	const insertAtCursor = (text: string) => {
		if (!textareaRef) return;

		textareaRef.focus();

		// execCommand("insertText") preserves the browser's native undo stack,
		// so Ctrl+Z works as expected. While technically deprecated since ~2015,
		// it still works in all browsers and has no replacement API for
		// programmatic text insertion with undo support.
		document.execCommand("insertText", false, text);

		props.onInput(textareaRef.value);
	};

	const modules = () => props.modules ?? [];

	const createContext = (): ToolbarContext => ({
		insert: insertAtCursor,
		closePanel: () => setActivePanel(null),
	});

	const handleModuleClick = (module: ToolbarModule) => {
		if (module.panel) {
			setActivePanel(activePanel() === module.id ? null : module.id);
		} else if (module.action) {
			module.action(createContext());
		}
	};

	const activeModule = () =>
		modules().find((m) => m.id === activePanel() && m.panel);

	return (
		<div
			class={`rounded-lg border border-outline dark:border-outline-dark bg-surface dark:bg-surface-dark overflow-hidden ${props.class ?? ""}`}
		>
			{/* Header: Tabs + Toolbar in one row */}
			<div class="flex items-center justify-between px-2 py-1.5 border-b border-outline dark:border-outline-dark bg-surface-alt/50 dark:bg-surface-dark-alt/50">
				{/* Tab buttons */}
				<div class="flex gap-1">
					<button
						type="button"
						onClick={() => setActiveTab("write")}
						class={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
							activeTab() === "write"
								? "bg-surface dark:bg-surface-dark text-on-surface dark:text-on-surface-dark"
								: "text-on-surface/60 dark:text-on-surface-dark/60 hover:text-on-surface dark:hover:text-on-surface-dark"
						}`}
					>
						Write
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("preview")}
						class={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
							activeTab() === "preview"
								? "bg-surface dark:bg-surface-dark text-on-surface dark:text-on-surface-dark"
								: "text-on-surface/60 dark:text-on-surface-dark/60 hover:text-on-surface dark:hover:text-on-surface-dark"
						}`}
					>
						Preview
					</button>
				</div>

				{/* Toolbar buttons - only show in write mode */}
				<Show when={activeTab() === "write" && modules().length > 0}>
					<div class="flex gap-0.5">
						<For each={modules()}>
							{(module) => (
								<button
									type="button"
									onClick={() => handleModuleClick(module)}
									title={module.label}
									class={`p-1.5 rounded text-on-surface/60 dark:text-on-surface-dark/60 hover:text-on-surface dark:hover:text-on-surface-dark hover:bg-surface dark:hover:bg-surface-dark transition-colors ${
										activePanel() === module.id
											? "bg-surface dark:bg-surface-dark text-on-surface dark:text-on-surface-dark"
											: ""
									}`}
								>
									{module.icon?.() ?? (
										<span class="text-xs font-medium">{module.label}</span>
									)}
								</button>
							)}
						</For>
					</div>
				</Show>
			</div>

			{/* Panel for active module (e.g., link form) */}
			<Show when={activeModule()}>
				{(module) => (
					<div class="px-3 py-2 border-b border-outline dark:border-outline-dark bg-surface-alt/30 dark:bg-surface-dark-alt/30">
						{module().panel?.(createContext())}
					</div>
				)}
			</Show>

			{/* Content area */}
			<Show when={activeTab() === "write"}>
				<MarkdownInput
					ref={(el) => {
						textareaRef = el;
					}}
					class="w-full min-h-50 border-0 rounded-none focus:ring-0"
					value={props.value}
					onInput={props.onInput}
				/>
			</Show>

			<Show when={activeTab() === "preview"}>
				<div class="p-4 min-h-50">
					<MarkdownOutput markdown={props.value} />
				</div>
			</Show>

			{/* Footer with submit */}
			<Show when={props.onSubmit}>
				<div class="flex justify-end gap-2 px-3 py-2 border-t border-outline dark:border-outline-dark bg-surface-alt/30 dark:bg-surface-dark-alt/30">
					<Show when={props.onCancel}>
						<Button onClick={props.onCancel} size="sm" variant="ghost">
							Cancel
						</Button>
					</Show>
					<Button onClick={props.onSubmit} size="sm">
						{props.submitLabel ?? "Submit"}
					</Button>
				</div>
			</Show>
		</div>
	);
};

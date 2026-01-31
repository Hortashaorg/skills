import { createSignal, For, type JSX, Show, splitProps } from "solid-js";
import { Textarea } from "@/components/primitives/textarea";
import { Button } from "@/components/ui/button";
import { MarkdownOutput } from "@/components/ui/markdown-output";
import { cn } from "@/lib/utils";
import type { ToolbarContext, ToolbarModule } from "./markdown-editor-types";
import { defaultModules } from "./modules";

export type MarkdownEditorProps = Omit<
	JSX.IntrinsicElements["div"],
	"onSubmit"
> & {
	value: string;
	onInput: (value: string) => void;
	onSubmit?: () => void;
	onCancel?: () => void;
	submitLabel?: string;
	cancelLabel?: string;
	placeholder?: string;
	minHeight?: string;
};

export const MarkdownEditor = (props: MarkdownEditorProps) => {
	const [local, others] = splitProps(props, [
		"value",
		"onInput",
		"onSubmit",
		"onCancel",
		"submitLabel",
		"cancelLabel",
		"placeholder",
		"minHeight",
		"class",
	]);

	let textareaRef: HTMLTextAreaElement | undefined;
	const [activeTab, setActiveTab] = createSignal<"write" | "preview">("write");
	const [activePanel, setActivePanel] = createSignal<string | null>(null);

	const minHeight = () => local.minHeight ?? "min-h-32";

	const insertAtCursor = (text: string) => {
		if (!textareaRef) return;

		textareaRef.focus();
		document.execCommand("insertText", false, text);
		local.onInput(textareaRef.value);
	};

	const modules = defaultModules;

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
		modules.find((m) => m.id === activePanel() && m.panel);

	return (
		<div
			class={cn(
				"rounded-radius border border-outline dark:border-outline-dark",
				"bg-surface dark:bg-surface-dark overflow-hidden",
				local.class,
			)}
			{...others}
		>
			{/* Header: Tabs + Toolbar */}
			<div class="flex items-center justify-between px-2 py-1.5 border-b border-outline dark:border-outline-dark bg-surface-alt/50 dark:bg-surface-dark-alt/50">
				{/* Tab buttons */}
				<div class="flex gap-1">
					<button
						type="button"
						onClick={() => setActiveTab("write")}
						class={cn(
							"px-3 py-1 text-sm font-medium rounded-radius transition-colors",
							activeTab() === "write"
								? "bg-surface dark:bg-surface-dark text-on-surface dark:text-on-surface-dark"
								: "text-on-surface-muted dark:text-on-surface-dark-muted hover:text-on-surface dark:hover:text-on-surface-dark",
						)}
					>
						Write
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("preview")}
						class={cn(
							"px-3 py-1 text-sm font-medium rounded-radius transition-colors",
							activeTab() === "preview"
								? "bg-surface dark:bg-surface-dark text-on-surface dark:text-on-surface-dark"
								: "text-on-surface-muted dark:text-on-surface-dark-muted hover:text-on-surface dark:hover:text-on-surface-dark",
						)}
					>
						Preview
					</button>
				</div>

				{/* Toolbar buttons - only show in write mode */}
				<Show when={activeTab() === "write" && modules.length > 0}>
					<div class="flex gap-0.5">
						<For each={modules}>
							{(module) => (
								<button
									type="button"
									onClick={() => handleModuleClick(module)}
									title={module.label}
									class={cn(
										"p-1.5 rounded-radius transition-colors",
										"text-on-surface-muted dark:text-on-surface-dark-muted",
										"hover:text-on-surface dark:hover:text-on-surface-dark",
										"hover:bg-surface dark:hover:bg-surface-dark",
										activePanel() === module.id &&
											"bg-surface dark:bg-surface-dark text-on-surface dark:text-on-surface-dark",
									)}
								>
									{module.icon ?? (
										<span class="text-xs font-medium">{module.label}</span>
									)}
								</button>
							)}
						</For>
					</div>
				</Show>
			</div>

			{/* Panel for active module */}
			<Show when={activeModule()}>
				{(module) => (
					<div class="px-3 py-2 border-b border-outline dark:border-outline-dark bg-surface-alt/30 dark:bg-surface-dark-alt/30">
						{module().panel?.(createContext())}
					</div>
				)}
			</Show>

			{/* Content area */}
			<Show when={activeTab() === "write"}>
				<Textarea
					ref={(el) => {
						textareaRef = el;
					}}
					variant="code"
					class={cn(
						"border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0",
						minHeight(),
					)}
					value={local.value}
					onInput={(e) => local.onInput(e.currentTarget.value)}
					placeholder={local.placeholder}
				/>
			</Show>

			<Show when={activeTab() === "preview"}>
				<div class={cn("p-4", minHeight())}>
					<Show
						when={local.value.trim()}
						fallback={
							<span class="text-on-surface/50 dark:text-on-surface-dark/50 text-sm italic">
								Nothing to preview
							</span>
						}
					>
						<MarkdownOutput content={local.value} />
					</Show>
				</div>
			</Show>

			{/* Footer with submit/cancel */}
			<Show when={local.onSubmit}>
				<div class="flex justify-end gap-2 px-3 py-2 border-t border-outline dark:border-outline-dark bg-surface-alt/30 dark:bg-surface-dark-alt/30">
					<Show when={local.onCancel}>
						<Button onClick={local.onCancel} size="sm" variant="ghost">
							{local.cancelLabel ?? "Cancel"}
						</Button>
					</Show>
					<Button onClick={local.onSubmit} size="sm">
						{local.submitLabel ?? "Submit"}
					</Button>
				</div>
			</Show>
		</div>
	);
};

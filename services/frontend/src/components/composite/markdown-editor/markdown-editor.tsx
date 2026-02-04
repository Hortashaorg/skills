import { createSignal, For, type JSX, Show, splitProps } from "solid-js";
import { Textarea } from "@/components/primitives/textarea";
import { Button } from "@/components/ui/button";
import { MarkdownOutput } from "@/components/ui/markdown-output";
import { cn } from "@/lib/utils";
import type {
	EntityByIds,
	EntitySearch,
	ToolbarContext,
	ToolbarModule,
} from "./markdown-editor-types";
import { defaultModules } from "./modules";
import { useEditor } from "./use-editor";

const isModule = (item: unknown): item is ToolbarModule =>
	typeof item === "object" && item !== null && "id" in item;

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
	maxLength?: number;
	/** Search hooks for toolbar modules to insert entity references */
	search: EntitySearch;
	/** Entity data maps for resolving tokens in preview */
	byIds: EntityByIds;
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
		"maxLength",
		"search",
		"byIds",
		"class",
	]);

	const [activeTab, setActiveTab] = createSignal<"write" | "preview">("write");
	const [activePanel, setActivePanel] = createSignal<string | null>(null);

	const minHeight = () => local.minHeight ?? "min-h-32";

	const editor = useEditor({ debug: import.meta.env.DEV });

	const modules = defaultModules;

	const createContext = (): ToolbarContext => ({
		insert: editor.mutators.insert,
		insertBlock: editor.mutators.insertBlock,
		wrap: editor.mutators.wrap,
		indent: editor.mutators.indent,
		outdent: editor.mutators.outdent,
		undo: editor.undo,
		redo: editor.redo,
		getSelectedText: editor.getSelectedText,
		closePanel: () => setActivePanel(null),
	});

	const handleModuleClick = (module: ToolbarModule) => {
		// If action exists, try it first - if it returns true, it handled everything
		if (module.action) {
			const handled = module.action(createContext());
			if (handled) return;
		}

		// Otherwise toggle the panel (if exists)
		if (module.panel) {
			setActivePanel(activePanel() === module.id ? null : module.id);
		}
	};

	const toolbarModules = modules.filter(isModule);

	const handleKeyDown = editor.createKeyDownHandler(
		toolbarModules,
		createContext,
	);

	const activeModule = () =>
		toolbarModules.find((m) => m.id === activePanel() && m.panel);

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
			<div class="border-b border-outline dark:border-outline-dark bg-surface-alt/50 dark:bg-surface-dark-alt/50">
				{/* Tab buttons */}
				<div class="flex gap-1 px-2 pt-1.5 pb-1">
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

				{/* Toolbar buttons - always visible, disabled in preview mode */}
				<Show when={modules.length > 0}>
					<div
						class={cn(
							"flex gap-0.5 px-2 pb-1.5",
							activeTab() === "preview" && "opacity-50 pointer-events-none",
						)}
					>
						<For each={modules}>
							{(item) =>
								"separator" in item ? (
									<div class="w-px h-5 mx-1 bg-outline/50 dark:bg-outline-dark/50 self-center" />
								) : (
									<button
										type="button"
										onClick={() => handleModuleClick(item)}
										title={item.label}
										class={cn(
											"p-1.5 rounded-radius transition-colors",
											"text-on-surface-muted dark:text-on-surface-dark-muted",
											"hover:text-on-surface dark:hover:text-on-surface-dark",
											"hover:bg-surface dark:hover:bg-surface-dark",
											activePanel() === item.id &&
												"bg-surface dark:bg-surface-dark text-on-surface dark:text-on-surface-dark",
										)}
									>
										{item.icon?.() ?? (
											<span class="text-xs font-medium">{item.label}</span>
										)}
									</button>
								)
							}
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
						if (!el) return;
						editor.setTextareaRef(el);
						el.value = local.value;
					}}
					variant="code"
					class={cn(
						"border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0",
						minHeight(),
					)}
					onInput={(e) => local.onInput(e.currentTarget.value)}
					onSelect={editor.handlers.onSelect}
					onKeyDown={handleKeyDown}
					onKeyUp={editor.handlers.onKeyUp}
					onMouseUp={editor.handlers.onMouseUp}
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
						<MarkdownOutput content={local.value} byIds={local.byIds} />
					</Show>
				</div>
			</Show>

			{/* Footer with character count and submit/cancel */}
			<Show when={local.onSubmit || local.maxLength}>
				<div class="flex items-center justify-between gap-2 px-3 py-2 border-t border-outline dark:border-outline-dark bg-surface-alt/30 dark:bg-surface-dark-alt/30">
					{/* Character count */}
					<Show when={local.maxLength} fallback={<div />}>
						{(max) => {
							const count = () => local.value.length;
							const isOverLimit = () => count() > max();
							const isNearLimit = () => count() > max() * 0.9;
							return (
								<span
									class={cn(
										"text-xs",
										isOverLimit()
											? "text-danger dark:text-danger-dark font-medium"
											: isNearLimit()
												? "text-warning dark:text-warning-dark"
												: "text-on-surface-muted dark:text-on-surface-dark-muted",
									)}
								>
									{count().toLocaleString()} / {max().toLocaleString()}
								</span>
							);
						}}
					</Show>

					{/* Submit/cancel buttons */}
					<Show when={local.onSubmit}>
						<div class="flex gap-2">
							<Show when={local.onCancel}>
								<Button onClick={local.onCancel} size="sm" variant="ghost">
									{local.cancelLabel ?? "Cancel"}
								</Button>
							</Show>
							<Button
								onClick={local.onSubmit}
								size="sm"
								disabled={
									local.maxLength ? local.value.length > local.maxLength : false
								}
							>
								{local.submitLabel ?? "Submit"}
							</Button>
						</div>
					</Show>
				</div>
			</Show>
		</div>
	);
};

import { createSignal, For, type JSX, Show, splitProps } from "solid-js";
import { Textarea } from "@/components/primitives/textarea";
import { Button } from "@/components/ui/button";
import { MarkdownOutput } from "@/components/ui/markdown-output";
import { cn } from "@/lib/utils";
import type { ToolbarContext, ToolbarModule } from "./markdown-editor-types";
import { defaultModules } from "./modules";
import { useTextareaUtility } from "./use-textarea-utility";

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
		"class",
	]);

	const [activeTab, setActiveTab] = createSignal<"write" | "preview">("write");
	const [activePanel, setActivePanel] = createSignal<string | null>(null);

	const minHeight = () => local.minHeight ?? "min-h-32";

	const textarea = useTextareaUtility({
		onValue: local.onInput,
		debug: import.meta.env.DEV,
	});

	const modules = defaultModules;

	const createContext = (): ToolbarContext => ({
		insert: textarea.mutators.insert,
		insertBlock: textarea.mutators.insertBlock,
		wrap: textarea.mutators.wrap,
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
			<div class="flex flex-wrap items-center justify-between gap-2 px-2 py-1.5 border-b border-outline dark:border-outline-dark bg-surface-alt/50 dark:bg-surface-dark-alt/50">
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
									{module.icon?.() ?? (
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
						textarea.setTextareaRef(el);
					}}
					variant="code"
					class={cn(
						"border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0",
						minHeight(),
					)}
					value={local.value}
					onInput={(e) => local.onInput(e.currentTarget.value)}
					onSelect={textarea.handlers.onSelect}
					onKeyUp={textarea.handlers.onKeyUp}
					onMouseUp={textarea.handlers.onMouseUp}
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

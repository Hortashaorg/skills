import { createSignal, For } from "solid-js";
import { Icon } from "@/components/primitives/icon";
import { Input } from "@/components/primitives/input";
import type { ToolbarModule } from "../markdown-editor-types";

const LANGUAGES = [
	{ id: "js", label: "JavaScript" },
	{ id: "ts", label: "TypeScript" },
	{ id: "tsx", label: "TSX" },
	{ id: "jsx", label: "JSX" },
	{ id: "html", label: "HTML" },
	{ id: "css", label: "CSS" },
	{ id: "json", label: "JSON" },
	{ id: "bash", label: "Bash" },
	{ id: "sh", label: "Shell" },
	{ id: "python", label: "Python" },
	{ id: "rust", label: "Rust" },
	{ id: "go", label: "Go" },
	{ id: "sql", label: "SQL" },
	{ id: "yaml", label: "YAML" },
	{ id: "md", label: "Markdown" },
	{ id: "diff", label: "Diff" },
	{ id: "", label: "Plain text" },
];

export const codeModule: ToolbarModule = {
	id: "code",
	label: "Code",
	icon: () => (
		<Icon class="w-4 h-4 md:w-5 md:h-5">
			<polyline points="16 18 22 12 16 6" />
			<polyline points="8 6 2 12 8 18" />
		</Icon>
	),
	panel: (ctx) => {
		const [search, setSearch] = createSignal("");

		const filteredLanguages = () => {
			const query = search().toLowerCase();
			if (!query) return LANGUAGES;
			return LANGUAGES.filter(
				(lang) =>
					lang.id.toLowerCase().includes(query) ||
					lang.label.toLowerCase().includes(query),
			);
		};

		const insertCodeBlock = (langId: string) => {
			ctx.insertBlock(`\`\`\`${langId}\n\n\`\`\``);
			ctx.closePanel();
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
				const first = filteredLanguages()[0];
				if (first) {
					insertCodeBlock(first.id);
				}
			}
		};

		return (
			<div class="flex flex-col gap-2">
				<Input
					type="text"
					size="sm"
					placeholder="Search language..."
					aria-label="Search language"
					value={search()}
					onInput={(e) => setSearch(e.currentTarget.value)}
					onKeyDown={handleKeyDown}
					autofocus
				/>
				<div class="flex flex-wrap gap-1">
					<For each={filteredLanguages()}>
						{(lang) => (
							<button
								type="button"
								onClick={() => insertCodeBlock(lang.id)}
								class="px-2 py-1 text-xs rounded-radius bg-surface dark:bg-surface-dark hover:bg-surface-alt dark:hover:bg-surface-dark-alt border border-outline/50 dark:border-outline-dark/50 transition-colors"
							>
								{lang.label}
							</button>
						)}
					</For>
				</div>
			</div>
		);
	},
};

import { createSignal, For, Show } from "solid-js";
import { Icon } from "@/components/primitives/icon";
import { Input } from "@/components/primitives/input";
import type { ToolbarModule } from "../markdown-editor-types";

const LANGUAGES = [
	// Web
	{ id: "js", label: "JavaScript" },
	{ id: "ts", label: "TypeScript" },
	{ id: "tsx", label: "TSX" },
	{ id: "jsx", label: "JSX" },
	{ id: "html", label: "HTML" },
	{ id: "css", label: "CSS" },
	{ id: "scss", label: "SCSS" },
	{ id: "json", label: "JSON" },
	{ id: "graphql", label: "GraphQL" },
	// Shell
	{ id: "bash", label: "Bash" },
	{ id: "sh", label: "Shell" },
	{ id: "powershell", label: "PowerShell" },
	// Systems
	{ id: "c", label: "C" },
	{ id: "cpp", label: "C++" },
	{ id: "csharp", label: "C#" },
	{ id: "rust", label: "Rust" },
	{ id: "go", label: "Go" },
	{ id: "zig", label: "Zig" },
	// JVM
	{ id: "java", label: "Java" },
	{ id: "kotlin", label: "Kotlin" },
	{ id: "scala", label: "Scala" },
	{ id: "groovy", label: "Groovy" },
	// Scripting
	{ id: "python", label: "Python" },
	{ id: "ruby", label: "Ruby" },
	{ id: "php", label: "PHP" },
	{ id: "perl", label: "Perl" },
	{ id: "lua", label: "Lua" },
	// Functional
	{ id: "haskell", label: "Haskell" },
	{ id: "elixir", label: "Elixir" },
	{ id: "erlang", label: "Erlang" },
	{ id: "clojure", label: "Clojure" },
	{ id: "fsharp", label: "F#" },
	{ id: "ocaml", label: "OCaml" },
	// Mobile
	{ id: "swift", label: "Swift" },
	{ id: "objc", label: "Objective-C" },
	{ id: "dart", label: "Dart" },
	// Data & Config
	{ id: "sql", label: "SQL" },
	{ id: "yaml", label: "YAML" },
	{ id: "toml", label: "TOML" },
	{ id: "xml", label: "XML" },
	{ id: "ini", label: "INI" },
	// Markup & Docs
	{ id: "md", label: "Markdown" },
	{ id: "latex", label: "LaTeX" },
	// DevOps
	{ id: "dockerfile", label: "Dockerfile" },
	{ id: "nginx", label: "Nginx" },
	{ id: "terraform", label: "Terraform" },
	// Other
	{ id: "r", label: "R" },
	{ id: "julia", label: "Julia" },
	{ id: "matlab", label: "MATLAB" },
	{ id: "diff", label: "Diff" },
	{ id: "regex", label: "Regex" },
	{ id: "mermaid", label: "Mermaid" },
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
				// Use first match, or custom input if no matches
				insertCodeBlock(first?.id ?? search().trim().toLowerCase());
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
					<Show when={filteredLanguages().length === 0 && search().trim()}>
						<button
							type="button"
							onClick={() => insertCodeBlock(search().trim().toLowerCase())}
							class="px-2 py-1 text-xs rounded-radius bg-primary/10 dark:bg-primary-dark/10 hover:bg-primary/20 dark:hover:bg-primary-dark/20 border border-primary/50 dark:border-primary-dark/50 transition-colors"
						>
							Use "{search().trim()}"
						</button>
					</Show>
				</div>
			</div>
		);
	},
};

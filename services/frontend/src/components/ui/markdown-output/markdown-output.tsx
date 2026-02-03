import mermaid from "mermaid";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { type JSX, onMount, splitProps } from "solid-js";
import { unified } from "unified";
import { cn } from "@/lib/utils";
import "./markdown-output.css";

// ─────────────────────────────────────────────────────────────────────────────
// Mermaid initialization
// ─────────────────────────────────────────────────────────────────────────────

let mermaidInitialized = false;

function initMermaid() {
	if (mermaidInitialized) return;
	mermaid.initialize({
		startOnLoad: false,
		theme: "default",
		securityLevel: "strict",
	});
	mermaidInitialized = true;
}

async function renderMermaidDiagrams(container: HTMLElement) {
	const codeBlocks = container.querySelectorAll("code.language-mermaid");
	if (codeBlocks.length === 0) return;

	initMermaid();

	for (const codeBlock of codeBlocks) {
		const pre = codeBlock.parentElement;
		if (!pre || pre.tagName !== "PRE") continue;

		const code = codeBlock.textContent ?? "";
		const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`;

		try {
			const { svg } = await mermaid.render(id, code);
			const wrapper = document.createElement("div");
			wrapper.className = "mermaid-diagram";
			wrapper.innerHTML = svg;
			pre.replaceWith(wrapper);
		} catch (err) {
			// Keep the code block visible on error
			console.error("Mermaid render error:", err);
		}
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Memoization cache for processed markdown
// ─────────────────────────────────────────────────────────────────────────────

const cache = new Map<string, string>();
const MAX_CACHE_SIZE = 100;

function getCachedOrProcess(markdown: string): string {
	const cached = cache.get(markdown);
	if (cached) return cached;

	const html = renderMarkdown(markdown);

	// Evict oldest entry if cache is full
	if (cache.size >= MAX_CACHE_SIZE) {
		const firstKey = cache.keys().next().value;
		if (firstKey) cache.delete(firstKey);
	}

	cache.set(markdown, html);
	return html;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sanitization schema (preserves syntax highlighting + mermaid classes)
// ─────────────────────────────────────────────────────────────────────────────

const sanitizeSchema = {
	...defaultSchema,
	attributes: {
		...defaultSchema.attributes,
		code: [...(defaultSchema.attributes?.code ?? []), "className"],
		span: [...(defaultSchema.attributes?.span ?? []), "className"],
	},
};

// ─────────────────────────────────────────────────────────────────────────────
// Unified processor pipeline
// ─────────────────────────────────────────────────────────────────────────────

const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkRehype)
	.use(rehypeHighlight)
	.use(rehypeSanitize, sanitizeSchema)
	.use(rehypeStringify);

function renderMarkdown(markdown: string): string {
	let html = processor.processSync(markdown).toString();

	// Add aria-labels to task list checkboxes for accessibility
	html = html.replace(/<input type="checkbox"[^>]*>/g, (match) => {
		const isChecked = match.includes("checked");
		const label = isChecked ? "Completed task" : "Pending task";
		return match.replace(">", ` aria-label="${label}">`);
	});

	return html;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export type MarkdownOutputProps = Omit<
	JSX.IntrinsicElements["div"],
	"children"
> & {
	content: string;
};

export const MarkdownOutput = (props: MarkdownOutputProps) => {
	const [local, others] = splitProps(props, ["content", "class"]);
	const html = () => getCachedOrProcess(local.content);

	let containerRef: HTMLDivElement | undefined;

	onMount(() => {
		if (containerRef) {
			renderMermaidDiagrams(containerRef);
		}
	});

	return (
		<div
			ref={containerRef}
			class={cn("prose max-w-none", local.class)}
			innerHTML={html()}
			{...others}
		/>
	);
};

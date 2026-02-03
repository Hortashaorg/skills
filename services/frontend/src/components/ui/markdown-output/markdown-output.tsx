import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { type JSX, splitProps } from "solid-js";
import { unified } from "unified";
import { cn } from "@/lib/utils";
import "./markdown-output.css";

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
// Sanitization schema (preserves syntax highlighting classes)
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

	return (
		<div
			class={cn("prose max-w-none", local.class)}
			innerHTML={html()}
			{...others}
		/>
	);
};

import mermaid from "mermaid";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import {
	createEffect,
	type JSX,
	on,
	onCleanup,
	onMount,
	splitProps,
} from "solid-js";
import { render } from "solid-js/web";
import { unified } from "unified";
import { cn } from "@/lib/utils";
import { type EntityData, EntityToken, type EntityType } from "./entity-token";
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

// Entity token pattern: $$type:uuid (not inside code blocks - handled by checking parent)
const ENTITY_TOKEN_REGEX =
	/\$\$(user|project|package|ecosystem):([a-zA-Z0-9_-]+)/g;

function renderMarkdown(markdown: string): string {
	let html = processor.processSync(markdown).toString();

	// Add aria-labels to task list checkboxes for accessibility
	html = html.replace(/<input type="checkbox"[^>]*>/g, (match) => {
		const isChecked = match.includes("checked");
		const label = isChecked ? "Completed task" : "Pending task";
		return match.replace(">", ` aria-label="${label}">`);
	});

	// Replace entity tokens with interactive spans (skip those inside <code> tags)
	// We do a two-pass approach: first mark code blocks, then replace tokens outside them
	html = replaceEntityTokens(html);

	return html;
}

function replaceEntityTokens(html: string): string {
	// Split by code tags to avoid replacing inside them
	const parts: string[] = [];
	let lastIndex = 0;
	const codeRegex = /<code[^>]*>[\s\S]*?<\/code>/gi;

	for (const match of html.matchAll(codeRegex)) {
		// Process text before this code block
		const before = html.slice(lastIndex, match.index);
		parts.push(replaceTokensInText(before));
		// Keep code block as-is
		parts.push(match[0]);
		lastIndex = (match.index ?? 0) + match[0].length;
	}

	// Process remaining text after last code block
	parts.push(replaceTokensInText(html.slice(lastIndex)));

	return parts.join("");
}

function replaceTokensInText(text: string): string {
	return text.replace(ENTITY_TOKEN_REGEX, (_match, type, id) => {
		return `<span class="entity-token" data-entity-type="${type}" data-entity-id="${id}" tabindex="0">${type}: ${id}</span>`;
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Entity token hydration
// ─────────────────────────────────────────────────────────────────────────────

type EntityResolver = (
	type: EntityType,
	id: string,
) => EntityData | null | undefined;

function hydrateEntityTokens(
	container: HTMLElement,
	resolveEntity?: EntityResolver,
): (() => void)[] {
	const disposers: (() => void)[] = [];
	const tokens = container.querySelectorAll<HTMLSpanElement>(
		"span.entity-token[data-entity-type][data-entity-id]",
	);

	for (const span of tokens) {
		const type = span.dataset.entityType as EntityType;
		const id = span.dataset.entityId;
		if (!type || !id) continue;

		const data = resolveEntity?.(type, id) ?? null;

		// Create a wrapper to mount SolidJS component
		const wrapper = document.createElement("span");
		wrapper.className = "entity-token-wrapper";
		span.replaceWith(wrapper);

		const dispose = render(
			() => <EntityToken type={type} id={id} data={data} />,
			wrapper,
		);
		disposers.push(dispose);
	}

	return disposers;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export type MarkdownOutputProps = Omit<
	JSX.IntrinsicElements["div"],
	"children"
> & {
	content: string;
	/** Optional resolver to look up entity data by type and id */
	resolveEntity?: EntityResolver;
};

export const MarkdownOutput = (props: MarkdownOutputProps) => {
	const [local, others] = splitProps(props, [
		"content",
		"class",
		"resolveEntity",
	]);
	const html = () => getCachedOrProcess(local.content);

	let containerRef: HTMLDivElement | undefined;
	let entityDisposers: (() => void)[] = [];

	const hydrateContent = () => {
		if (!containerRef) return;

		// Clean up previous entity tokens
		for (const dispose of entityDisposers) {
			dispose();
		}
		entityDisposers = [];

		// Hydrate new content
		renderMermaidDiagrams(containerRef);
		entityDisposers = hydrateEntityTokens(containerRef, local.resolveEntity);
	};

	onMount(hydrateContent);

	// Re-hydrate when content changes
	createEffect(on(() => local.content, hydrateContent, { defer: true }));

	onCleanup(() => {
		for (const dispose of entityDisposers) {
			dispose();
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

export type { EntityData, EntityType };

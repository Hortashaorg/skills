import mermaid from "mermaid";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { createEffect, type JSX, onCleanup, splitProps } from "solid-js";
import { unified } from "unified";
import {
	type EntityType,
	getEntityIcon,
	getEntityLabel,
} from "@/components/composite/markdown-editor/entity-types";
import type { EntityByIds } from "@/components/composite/markdown-editor/markdown-editor-types";
import { buildPackageUrl } from "@/lib/url";
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

	if (cache.size >= MAX_CACHE_SIZE) {
		const firstKey = cache.keys().next().value;
		if (firstKey) cache.delete(firstKey);
	}

	cache.set(markdown, html);
	return html;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sanitization schema
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

// Entity token pattern: $$type:id
const ENTITY_TOKEN_REGEX =
	/\$\$(user|project|package|ecosystem):([a-zA-Z0-9_-]+)/g;

function renderMarkdown(markdown: string): string {
	let html = processor.processSync(markdown).toString();

	// Add aria-labels to task list checkboxes
	html = html.replace(/<input type="checkbox"[^>]*>/g, (match) => {
		const isChecked = match.includes("checked");
		const label = isChecked ? "Completed task" : "Pending task";
		return match.replace(">", ` aria-label="${label}">`);
	});

	// Replace entity tokens (skip inside code blocks)
	html = replaceEntityTokens(html);

	return html;
}

function replaceEntityTokens(html: string): string {
	const parts: string[] = [];
	let lastIndex = 0;
	const codeRegex = /<code[^>]*>[\s\S]*?<\/code>/gi;

	for (const match of html.matchAll(codeRegex)) {
		const before = html.slice(lastIndex, match.index);
		parts.push(replaceTokensInText(before));
		parts.push(match[0]);
		lastIndex = (match.index ?? 0) + match[0].length;
	}

	parts.push(replaceTokensInText(html.slice(lastIndex)));
	return parts.join("");
}

function replaceTokensInText(text: string): string {
	return text.replace(ENTITY_TOKEN_REGEX, (_match, type, id) => {
		const icon = getEntityIcon(type as EntityType);
		const label = getEntityLabel(type as EntityType);
		// Render as a styled link placeholder - will be enhanced with data if resolvers provided
		return `<a class="entity-token-link" data-entity-type="${type}" data-entity-id="${id}" href="#" tabindex="0"><span class="entity-token-icon">${icon}</span><span class="entity-token-label">${label}:</span><span class="entity-token-name">${id}</span></a>`;
	});
}

// ─────────────────────────────────────────────────────────────────────────────
// Entity data resolution from byIds maps
// ─────────────────────────────────────────────────────────────────────────────

type ResolvedEntityData = {
	type: EntityType;
	name: string;
	href: string;
	description?: string | null;
	registry?: string;
	memberSince?: string;
};

function resolveEntityData(
	type: EntityType,
	id: string,
	byIds: EntityByIds,
): ResolvedEntityData | null {
	switch (type) {
		case "package": {
			const pkg = byIds.packages().get(id);
			if (!pkg) return null;
			return {
				type: "package",
				name: pkg.name,
				href: buildPackageUrl(pkg.registry, pkg.name),
				description: pkg.description,
				registry: pkg.registry,
			};
		}
		case "ecosystem": {
			const eco = byIds.ecosystems().get(id);
			if (!eco) return null;
			return {
				type: "ecosystem",
				name: eco.name,
				href: `/ecosystems/${eco.slug}`,
				description: eco.description,
			};
		}
		case "project": {
			const project = byIds.projects().get(id);
			if (!project) return null;
			return {
				type: "project",
				name: project.name,
				href: `/projects/${project.id}`,
				description: project.description,
			};
		}
		case "user": {
			const user = byIds.users().get(id);
			if (!user) return null;
			return {
				type: "user",
				name: user.name ?? "Unknown",
				href: `/user/${user.id}`,
				memberSince: user.createdAt
					? new Date(user.createdAt).toLocaleDateString()
					: undefined,
			};
		}
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Entity token enhancement (updates links with resolved data + adds hover)
// ─────────────────────────────────────────────────────────────────────────────

function enhanceEntityTokens(
	container: HTMLElement,
	byIds: EntityByIds,
): (() => void)[] {
	const cleanups: (() => void)[] = [];
	const tokens = container.querySelectorAll<HTMLAnchorElement>(
		"a.entity-token-link[data-entity-type][data-entity-id]",
	);

	// Create a single popover element for the whole container
	const popover = document.createElement("div");
	popover.className = "entity-popover";
	popover.style.display = "none";
	container.appendChild(popover);

	let hideTimeout: ReturnType<typeof setTimeout> | null = null;

	const showPopover = (
		anchor: HTMLElement,
		data: ResolvedEntityData | null,
	) => {
		if (hideTimeout) {
			clearTimeout(hideTimeout);
			hideTimeout = null;
		}

		const rect = anchor.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();

		popover.style.position = "absolute";
		popover.style.left = `${rect.left - containerRect.left}px`;
		popover.style.top = `${rect.bottom - containerRect.top + 4}px`;
		popover.style.display = "block";

		if (data) {
			popover.innerHTML = `
				<div class="entity-popover-content">
					<div class="entity-popover-header">
						<span class="entity-popover-icon">${getEntityIcon(data.type)}</span>
						<div class="entity-popover-info">
							<div class="entity-popover-name">${escapeHtml(data.name)}</div>
							${data.registry ? `<div class="entity-popover-meta">${escapeHtml(data.registry)}</div>` : ""}
							${data.memberSince ? `<div class="entity-popover-meta">Member since ${escapeHtml(data.memberSince)}</div>` : ""}
						</div>
					</div>
					${data.description ? `<p class="entity-popover-desc">${escapeHtml(data.description)}</p>` : ""}
				</div>
			`;
		} else {
			popover.innerHTML = `<div class="entity-popover-empty">Not found</div>`;
		}
	};

	const hidePopover = () => {
		hideTimeout = setTimeout(() => {
			popover.style.display = "none";
		}, 150);
	};

	// Keep popover open when hovering over it
	popover.addEventListener("mouseenter", () => {
		if (hideTimeout) {
			clearTimeout(hideTimeout);
			hideTimeout = null;
		}
	});
	popover.addEventListener("mouseleave", hidePopover);

	for (const link of tokens) {
		const type = link.dataset.entityType as EntityType;
		const id = link.dataset.entityId;
		if (!type || !id) continue;

		const data = resolveEntityData(type, id, byIds);

		// Update link with resolved data
		if (data) {
			const nameSpan = link.querySelector(".entity-token-name");
			if (nameSpan) nameSpan.textContent = data.name;
			link.href = data.href;
		}

		// Add hover handlers
		const onMouseEnter = () => showPopover(link, data);
		const onMouseLeave = () => hidePopover();
		const onFocus = () => showPopover(link, data);
		const onBlur = () => hidePopover();

		link.addEventListener("mouseenter", onMouseEnter);
		link.addEventListener("mouseleave", onMouseLeave);
		link.addEventListener("focus", onFocus);
		link.addEventListener("blur", onBlur);

		cleanups.push(() => {
			link.removeEventListener("mouseenter", onMouseEnter);
			link.removeEventListener("mouseleave", onMouseLeave);
			link.removeEventListener("focus", onFocus);
			link.removeEventListener("blur", onBlur);
		});
	}

	cleanups.push(() => {
		if (hideTimeout) clearTimeout(hideTimeout);
		popover.remove();
	});

	return cleanups;
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export type MarkdownOutputProps = Omit<
	JSX.IntrinsicElements["div"],
	"children"
> & {
	content: string;
	/** Entity data maps for resolving tokens ($$user:id, $$package:id, etc.) */
	byIds: EntityByIds;
};

export const MarkdownOutput = (props: MarkdownOutputProps) => {
	const [local, others] = splitProps(props, ["content", "class", "byIds"]);
	const html = () => getCachedOrProcess(local.content);

	let containerRef: HTMLDivElement | undefined;
	let cleanups: (() => void)[] = [];

	createEffect(() => {
		html();
		if (!containerRef) return;

		// Clean up previous enhancements
		for (const cleanup of cleanups) {
			cleanup();
		}
		cleanups = [];

		requestAnimationFrame(() => {
			if (!containerRef) return;
			renderMermaidDiagrams(containerRef);
			cleanups = enhanceEntityTokens(containerRef, local.byIds);
		});
	});

	onCleanup(() => {
		for (const cleanup of cleanups) {
			cleanup();
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

export type { EntityByIds, EntityType };

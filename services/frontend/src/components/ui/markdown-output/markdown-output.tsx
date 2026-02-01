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

// Sanitize schema that preserves syntax highlighting classes
const sanitizeSchema = {
	...defaultSchema,
	attributes: {
		...defaultSchema.attributes,
		// Allow class on code and span for syntax highlighting
		code: [...(defaultSchema.attributes?.code ?? []), "className"],
		span: [...(defaultSchema.attributes?.span ?? []), "className"],
	},
};

const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkRehype)
	.use(rehypeHighlight)
	.use(rehypeSanitize, sanitizeSchema)
	.use(rehypeStringify);

function renderMarkdown(markdown: string): string {
	let html = processor.processSync(markdown).toString();

	// Style @mentions
	html = html.replace(/@([a-zA-Z0-9_-]+)/g, '<span class="mention">@$1</span>');

	// Add aria-labels to task list checkboxes for accessibility
	html = html.replace(/<input type="checkbox"[^>]*>/g, (match) => {
		const isChecked = match.includes("checked");
		const label = isChecked ? "Completed task" : "Pending task";
		return match.replace(">", ` aria-label="${label}">`);
	});

	return html;
}

export type MarkdownOutputProps = Omit<
	JSX.IntrinsicElements["div"],
	"children"
> & {
	content: string;
};

export const MarkdownOutput = (props: MarkdownOutputProps) => {
	const [local, others] = splitProps(props, ["content", "class"]);
	const html = () => renderMarkdown(local.content);

	return (
		<div
			class={cn("prose max-w-none", local.class)}
			innerHTML={html()}
			{...others}
		/>
	);
};

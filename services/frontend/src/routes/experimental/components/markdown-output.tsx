import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import "./markdown-output.css";

const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkRehype)
	.use(rehypeHighlight)
	.use(rehypeStringify);

function renderMarkdown(markdown: string): string {
	return processor.processSync(markdown).toString();
}

type MarkdownOutputProps = {
	markdown: string;
	class?: string;
};

export const MarkdownOutput = (props: MarkdownOutputProps) => {
	const html = () => renderMarkdown(props.markdown);

	return (
		<div class={`prose max-w-none ${props.class ?? ""}`} innerHTML={html()} />
	);
};

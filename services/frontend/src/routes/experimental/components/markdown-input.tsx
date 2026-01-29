import type { JSX } from "solid-js";

type MarkdownInputProps = {
	value: string;
	onInput: (value: string) => void;
	ref?: (el: HTMLTextAreaElement) => void;
	class?: string;
} & Omit<
	JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
	"onInput" | "value" | "ref"
>;

export const MarkdownInput = (props: MarkdownInputProps) => {
	return (
		<textarea
			ref={props.ref}
			class={`p-5 font-mono text-sm rounded-lg resize-none bg-surface dark:bg-surface-dark border-2 border-outline dark:border-outline-dark text-on-surface dark:text-on-surface-dark outline-none ring-0 focus:border-primary ${props.class ?? ""}`}
			value={props.value}
			onInput={(e) => props.onInput(e.target.value)}
			spellcheck={false}
		/>
	);
};

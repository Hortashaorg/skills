import { type JSX, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

export type MarkdownInputProps = Omit<
	JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
	"onInput" | "value"
> & {
	value: string;
	onInput: (value: string) => void;
	ref?: (el: HTMLTextAreaElement) => void;
};

export const MarkdownInput = (props: MarkdownInputProps) => {
	const [local, others] = splitProps(props, [
		"value",
		"onInput",
		"ref",
		"class",
	]);

	return (
		<textarea
			ref={local.ref}
			class={cn(
				"p-4",
				"font-mono",
				"text-sm",
				"resize-none",
				"bg-surface dark:bg-surface-dark",
				"text-on-surface dark:text-on-surface-dark",
				"border border-outline dark:border-outline-dark",
				"rounded-radius",
				"outline-none",
				"focus:border-primary dark:focus:border-primary-dark",
				"placeholder:text-on-surface/50 dark:placeholder:text-on-surface-dark/50",
				local.class,
			)}
			value={local.value}
			onInput={(e) => local.onInput(e.target.value)}
			spellcheck={false}
			{...others}
		/>
	);
};

import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
	[
		"w-full",
		"rounded-radius",
		"border",
		"border-outline",
		"dark:border-outline-dark",
		"bg-transparent",
		"text-on-surface",
		"dark:text-on-surface-dark",
		"placeholder:text-on-surface-muted",
		"dark:placeholder:text-on-surface-dark-muted",
		"transition-colors",
		"focus-visible:outline-none",
		"focus-visible:ring-2",
		"focus-visible:ring-primary",
		"dark:focus-visible:ring-primary-dark",
		"focus-visible:ring-offset-2",
		"disabled:opacity-50",
		"disabled:cursor-not-allowed",
	],
	{
		variants: {
			variant: {
				default: [],
				code: ["font-mono"],
			},
			size: {
				sm: ["px-2", "py-1", "text-xs"],
				md: ["px-3", "py-2", "text-sm"],
				lg: ["px-4", "py-3", "text-base"],
			},
			resizable: {
				true: ["resize-y"],
				false: ["resize-none"],
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
			resizable: false,
		},
	},
);

export type TextareaProps = Omit<JSX.IntrinsicElements["textarea"], "size"> &
	VariantProps<typeof textareaVariants>;

export const Textarea = (props: TextareaProps) => {
	const [local, others] = splitProps(props, [
		"variant",
		"size",
		"resizable",
		"class",
		"value",
	]);

	// Code variant disables spellcheck by default
	const spellcheck = () =>
		local.variant === "code" ? false : props.spellcheck;

	return (
		<textarea
			class={cn(
				textareaVariants({
					variant: local.variant,
					size: local.size,
					resizable: local.resizable,
				}),
				local.class,
			)}
			spellcheck={spellcheck()}
			value={local.value}
			{...others}
		/>
	);
};

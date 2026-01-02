import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

const inputVariants = cva(
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
			size: {
				sm: ["h-8", "px-2", "py-1", "text-xs"],
				md: ["h-10", "px-3", "py-2", "text-sm"],
				lg: ["h-12", "px-4", "py-3", "text-base"],
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

export type InputProps = Omit<JSX.IntrinsicElements["input"], "size"> &
	VariantProps<typeof inputVariants>;

export const Input = (props: InputProps) => {
	const [local, others] = splitProps(props, ["size", "class"]);

	return (
		<input
			class={cn(inputVariants({ size: local.size }), local.class)}
			{...others}
		/>
	);
};

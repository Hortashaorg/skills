import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, Show, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

const spinnerVariants = cva("animate-spin", {
	variants: {
		size: {
			sm: "h-4 w-4",
			md: "h-5 w-5",
			lg: "h-6 w-6",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

export interface SpinnerProps
	extends VariantProps<typeof spinnerVariants>,
		JSX.HTMLAttributes<HTMLOutputElement> {
	/** Optional loading text to display next to spinner */
	label?: string;
	/** Screen reader text (defaults to "Loading") */
	srText?: string;
}

export const Spinner = (props: SpinnerProps) => {
	const [local, others] = splitProps(props, [
		"size",
		"label",
		"srText",
		"class",
	]);

	return (
		<output
			class={cn(
				"inline-flex items-center gap-2 text-on-surface-muted dark:text-on-surface-dark-muted",
				local.class,
			)}
			{...others}
		>
			<svg
				class={spinnerVariants({ size: local.size })}
				fill="none"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<circle
					class="opacity-25"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					stroke-width="4"
				/>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				/>
			</svg>
			<Show when={local.label}>
				<span class="text-sm">{local.label}</span>
			</Show>
			<span class="sr-only">{local.srText ?? "Loading"}</span>
		</output>
	);
};

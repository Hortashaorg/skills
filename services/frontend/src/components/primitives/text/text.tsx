import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, splitProps, type ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "@/lib/utils";

const textVariants = cva("", {
	variants: {
		size: {
			xs: "text-xs",
			sm: "text-sm",
			base: "text-base",
			lg: "text-lg",
			xl: "text-xl",
		},
		weight: {
			normal: "font-normal",
			medium: "font-medium",
			semibold: "font-semibold",
			bold: "font-bold",
		},
		color: {
			default: "text-on-surface dark:text-on-surface-dark",
			strong: "text-on-surface-strong dark:text-on-surface-dark-strong",
			muted: "text-on-surface/70 dark:text-on-surface-dark/70",
			primary: "text-primary dark:text-primary-dark",
			danger: "text-danger",
			success: "text-success",
			warning: "text-warning",
			info: "text-info",
		},
	},
	defaultVariants: {
		size: "base",
		weight: "normal",
		color: "default",
	},
});

export type TextProps = {
	as?: ValidComponent;
	children?: JSX.Element;
	class?: string;
} & VariantProps<typeof textVariants> &
	JSX.HTMLAttributes<HTMLElement>;

export const Text = (props: TextProps) => {
	const [local, others] = splitProps(props, [
		"as",
		"children",
		"class",
		"size",
		"weight",
		"color",
	]);

	return (
		<Dynamic
			component={local.as ?? "p"}
			class={cn(
				textVariants({
					size: local.size,
					weight: local.weight,
					color: local.color,
				}),
				local.class,
			)}
			{...(others as JSX.HTMLAttributes<HTMLElement>)}
		>
			{local.children}
		</Dynamic>
	);
};

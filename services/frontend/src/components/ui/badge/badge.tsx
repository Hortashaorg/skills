import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, splitProps, type ValidComponent } from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
	[
		"inline-flex",
		"items-center",
		"justify-center",
		"rounded-full",
		"font-medium",
		"transition-colors",
	],
	{
		variants: {
			variant: {
				primary: [
					"bg-primary",
					"text-on-primary",
					"dark:bg-primary-dark",
					"dark:text-on-primary-dark",
				],
				secondary: [
					"bg-secondary",
					"text-on-secondary",
					"dark:bg-secondary-dark",
					"dark:text-on-secondary-dark",
				],
				success: [
					"bg-success",
					"text-on-success",
					"dark:bg-success",
					"dark:text-on-success",
				],
				danger: [
					"bg-danger",
					"text-on-danger",
					"dark:bg-danger",
					"dark:text-on-danger",
				],
				warning: [
					"bg-warning",
					"text-on-warning",
					"dark:bg-warning",
					"dark:text-on-warning",
				],
				info: ["bg-info", "text-on-info", "dark:bg-info", "dark:text-on-info"],
				outline: [
					"border",
					"border-dashed",
					"border-outline",
					"dark:border-outline-dark",
					"text-on-surface-muted",
					"dark:text-on-surface-dark-muted",
					"hover:border-primary",
					"hover:text-primary",
					"dark:hover:border-primary-dark",
					"dark:hover:text-primary-dark",
					"cursor-pointer",
				],
				subtle: [
					"bg-primary/10",
					"dark:bg-primary-dark/15",
					"text-on-surface-strong",
					"dark:text-on-surface-dark-strong",
				],
			},
			size: {
				sm: ["text-xs", "px-2", "py-0.5", "h-5"],
				md: ["text-sm", "px-2.5", "py-1", "h-6"],
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
		},
	},
);

export type BadgeProps = {
	/** Element type to render (default: "span", use "button" for interactive badges) */
	as?: ValidComponent;
	children?: JSX.Element;
	class?: string;
} & VariantProps<typeof badgeVariants> &
	Omit<JSX.HTMLAttributes<HTMLElement>, "children">;

export const Badge = (props: BadgeProps) => {
	const [local, others] = splitProps(props, [
		"as",
		"variant",
		"size",
		"class",
		"children",
	]);
	const isButton = () => local.as === "button";
	return (
		<Dynamic
			component={local.as ?? "span"}
			type={isButton() ? "button" : undefined}
			class={cn(
				badgeVariants({ variant: local.variant, size: local.size }),
				local.class,
			)}
			{...(others as JSX.HTMLAttributes<HTMLElement>)}
		>
			{local.children}
		</Dynamic>
	);
};

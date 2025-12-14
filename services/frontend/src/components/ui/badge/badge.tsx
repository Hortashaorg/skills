import { cva, type VariantProps } from "class-variance-authority";
import type { JSX } from "solid-js";
import { splitProps } from "solid-js";
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
	children?: JSX.Element;
	class?: string;
	/** Semantic role for the badge. Use "status" for live updates, "note" for static labels. */
	role?: "status" | "note" | "mark";
	/** Accessible label for screen readers when badge content isn't descriptive */
	"aria-label"?: string;
	/** Hide badge from screen readers when purely decorative */
	"aria-hidden"?: boolean;
} & VariantProps<typeof badgeVariants>;

export const Badge = (props: BadgeProps) => {
	const [local, others] = splitProps(props, ["variant", "size", "class"]);
	return (
		<span
			class={cn(
				badgeVariants({ variant: local.variant, size: local.size }),
				local.class,
			)}
			{...(others as JSX.HTMLAttributes<HTMLSpanElement>)}
		/>
	);
};

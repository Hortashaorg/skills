import {
	Button as ButtonPrimitive,
	type ButtonRootProps,
} from "@kobalte/core/button";
import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	[
		"whitespace-nowrap",
		"rounded-radius",
		"border",
		"font-medium",
		"tracking-wide",
		"transition",
		"hover:opacity-75",
		"text-center",
		"focus-visible:outline-2",
		"focus-visible:outline-offset-2",
		"active:opacity-100",
		"active:outline-offset-0",
		"disabled:opacity-50",
		"disabled:cursor-not-allowed",
		"cursor-pointer",
	],
	{
		variants: {
			variant: {
				primary: [
					"bg-primary",
					"border-primary",
					"text-on-primary",
					"focus-visible:outline-primary",
					"dark:bg-primary-dark",
					"dark:border-primary-dark",
					"dark:text-on-primary-dark",
					"dark:focus-visible:outline-primary-dark",
				],
				secondary: [
					"bg-secondary",
					"border-secondary",
					"text-on-secondary",
					"focus-visible:outline-primary",
					"dark:bg-secondary-dark",
					"dark:border-secondary-dark",
					"dark:text-on-secondary-dark",
					"dark:focus-visible:outline-secondary-dark",
				],
				alternate: [
					"bg-surface-alt",
					"border-surface-alt",
					"text-on-surface-strong",
					"focus-visible:outline-surface-alt",
					"dark:bg-surface-dark-alt",
					"dark:border-surface-dark-alt",
					"dark:text-on-surface-dark-strong",
					"dark:focus-visible:outline-surface-dark-alt",
				],
				inverse: [
					"bg-surface-dark",
					"border-surface-dark",
					"text-on-surface-dark",
					"focus-visible:outline-surface-dark",
					"dark:bg-surface",
					"dark:border-surface",
					"dark:text-on-surface",
					"dark:focus-visible:outline-surface",
				],
				info: [
					"bg-info",
					"border-info",
					"text-on-info",
					"focus-visible:outline-info",
					"dark:bg-info",
					"dark:border-info",
					"dark:text-on-info",
					"dark:focus-visible:outline-info",
				],
				danger: [
					"bg-danger",
					"border-danger",
					"text-on-danger",
					"focus-visible:outline-danger",
					"dark:bg-danger",
					"dark:border-danger",
					"dark:text-on-danger",
					"dark:focus-visible:outline-danger",
				],
				warning: [
					"bg-warning",
					"border-warning",
					"text-on-warning",
					"focus-visible:outline-warning",
					"dark:bg-warning",
					"dark:border-warning",
					"dark:text-on-warning",
					"dark:focus-visible:outline-warning",
				],
				success: [
					"bg-success",
					"border-success",
					"text-on-success",
					"focus-visible:outline-success",
					"dark:bg-success",
					"dark:border-success",
					"dark:text-on-success",
					"dark:focus-visible:outline-success",
				],
				outline: [
					"bg-transparent",
					"border-outline-strong",
					"text-on-surface",
					"focus-visible:outline-primary",
					"dark:border-outline-dark-strong",
					"dark:text-on-surface-dark",
					"dark:focus-visible:outline-primary-dark",
				],
			},
			size: {
				sm: ["text-xs", "px-2", "py-1"],
				md: ["text-sm", "px-4", "py-2"],
				lg: ["text-base", "px-4", "py-2"],
				xl: ["text-lg", "px-4", "py-2"],
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
		},
	},
);

export type ButtonProps = JSX.IntrinsicElements["button"] &
	ButtonRootProps<"button"> &
	VariantProps<typeof buttonVariants>;

export const Button = (props: ButtonProps) => {
	const [local, others] = splitProps(props, ["variant", "size", "class"]);

	return (
		<ButtonPrimitive
			class={cn(
				buttonVariants({ variant: local.variant, size: local.size }),
				local.class,
			)}
			{...others}
		/>
	);
};

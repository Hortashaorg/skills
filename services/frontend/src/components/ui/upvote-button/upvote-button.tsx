import {
	ToggleButton as ToggleButtonPrimitive,
	type ToggleButtonRootProps,
} from "@kobalte/core/toggle-button";
import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, splitProps } from "solid-js";
import { ArrowUpIcon } from "@/components/primitives/icon";
import { cn } from "@/lib/utils";

const upvoteButtonVariants = cva(
	[
		"inline-flex",
		"items-center",
		"gap-1",
		"rounded-radius",
		"border",
		"font-medium",
		"transition",
		"cursor-pointer",
		"focus-visible:outline-2",
		"focus-visible:outline-offset-2",
		"disabled:opacity-50",
		"disabled:cursor-not-allowed",
	],
	{
		variants: {
			size: {
				sm: ["text-xs", "px-2", "py-1"],
				md: ["text-sm", "px-3", "py-1.5"],
			},
		},
		defaultVariants: {
			size: "sm",
		},
	},
);

export type UpvoteButtonProps = Omit<
	JSX.IntrinsicElements["button"],
	"onClick" | "onChange"
> &
	Omit<ToggleButtonRootProps<"button">, "pressed" | "onChange"> &
	VariantProps<typeof upvoteButtonVariants> & {
		count: number;
		isUpvoted: boolean;
		onClick?: () => void;
	};

export const UpvoteButton = (props: UpvoteButtonProps) => {
	const [local, others] = splitProps(props, [
		"size",
		"class",
		"count",
		"isUpvoted",
		"onClick",
		"disabled",
	]);

	// When disabled (anonymous user), render as static display
	if (local.disabled) {
		return (
			<span
				class={cn(
					upvoteButtonVariants({ size: local.size }),
					"cursor-default",
					"border-outline",
					"text-on-surface-muted",
					"dark:border-outline-dark",
					"dark:text-on-surface-dark-muted",
					local.class,
				)}
			>
				<ArrowUpIcon size="xs" />
				<span>{local.count}</span>
			</span>
		);
	}

	return (
		<ToggleButtonPrimitive
			pressed={local.isUpvoted}
			onChange={(_pressed: boolean) => local.onClick?.()}
			class={cn(
				upvoteButtonVariants({ size: local.size }),
				local.isUpvoted
					? [
							"bg-primary",
							"border-primary",
							"text-on-primary",
							"focus-visible:outline-primary",
							"dark:bg-primary-dark",
							"dark:border-primary-dark",
							"dark:text-on-primary-dark",
							"dark:focus-visible:outline-primary-dark",
						]
					: [
							"bg-transparent",
							"border-outline-strong",
							"text-on-surface",
							"hover:border-primary",
							"hover:text-primary",
							"hover:bg-primary/10",
							"focus-visible:outline-primary",
							"dark:border-outline-dark-strong",
							"dark:text-on-surface-dark",
							"dark:hover:border-primary-dark",
							"dark:hover:text-primary-dark",
							"dark:hover:bg-primary-dark/10",
							"dark:focus-visible:outline-primary-dark",
						],
				local.class,
			)}
			{...others}
		>
			<ArrowUpIcon size="xs" />
			<span>{local.count}</span>
		</ToggleButtonPrimitive>
	);
};

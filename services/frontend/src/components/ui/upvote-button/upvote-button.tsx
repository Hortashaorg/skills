import {
	ToggleButton as ToggleButtonPrimitive,
	type ToggleButtonRootProps,
} from "@kobalte/core/toggle-button";
import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, splitProps } from "solid-js";
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

const ArrowUpIcon = (props: JSX.SvgSVGAttributes<SVGSVGElement>) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 20 20"
		fill="currentColor"
		width="1em"
		height="1em"
		aria-hidden="true"
		{...props}
	>
		<path
			fill-rule="evenodd"
			d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
			clip-rule="evenodd"
		/>
	</svg>
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
				<ArrowUpIcon />
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
			<ArrowUpIcon />
			<span>{local.count}</span>
		</ToggleButtonPrimitive>
	);
};

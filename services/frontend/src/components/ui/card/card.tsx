import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

const cardVariants = cva(
	[
		"rounded-radius",
		"bg-surface",
		"dark:bg-surface-dark",
		"border",
		"border-outline",
		"dark:border-outline-dark",
	],
	{
		variants: {
			padding: {
				none: "p-0",
				sm: "p-3",
				md: "p-4",
				lg: "p-6",
			},
		},
		defaultVariants: {
			padding: "md",
		},
	},
);

export type CardProps = {
	children?: JSX.Element;
	class?: string;
} & VariantProps<typeof cardVariants> &
	JSX.HTMLAttributes<HTMLDivElement>;

export const Card = (props: CardProps) => {
	const [local, others] = splitProps(props, ["children", "class", "padding"]);

	return (
		<div
			class={cn(cardVariants({ padding: local.padding }), local.class)}
			{...(others as JSX.HTMLAttributes<HTMLDivElement>)}
		>
			{local.children}
		</div>
	);
};

import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

const stackVariants = cva("flex", {
	variants: {
		direction: {
			vertical: "flex-col",
			horizontal: "flex-row",
		},
		spacing: {
			none: "gap-0",
			xs: "gap-1",
			sm: "gap-2",
			md: "gap-4",
			lg: "gap-6",
			xl: "gap-8",
		},
		align: {
			start: "items-start",
			center: "items-center",
			end: "items-end",
			stretch: "items-stretch",
		},
	},
	defaultVariants: {
		direction: "vertical",
		spacing: "md",
		align: "stretch",
	},
});

export type StackProps = {
	children?: JSX.Element;
	class?: string;
} & VariantProps<typeof stackVariants> &
	JSX.HTMLAttributes<HTMLDivElement>;

export const Stack = (props: StackProps) => {
	const [local, others] = splitProps(props, [
		"children",
		"class",
		"direction",
		"spacing",
		"align",
	]);

	return (
		<div
			class={cn(
				stackVariants({
					direction: local.direction,
					spacing: local.spacing,
					align: local.align,
				}),
				local.class,
			)}
			{...(others as JSX.HTMLAttributes<HTMLDivElement>)}
		>
			{local.children}
		</div>
	);
};

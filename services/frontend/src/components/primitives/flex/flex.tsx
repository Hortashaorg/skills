import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

const flexVariants = cva("flex", {
	variants: {
		direction: {
			row: "flex-row",
			column: "flex-col",
			rowReverse: "flex-row-reverse",
			columnReverse: "flex-col-reverse",
		},
		align: {
			start: "items-start",
			center: "items-center",
			end: "items-end",
			stretch: "items-stretch",
			baseline: "items-baseline",
		},
		justify: {
			start: "justify-start",
			center: "justify-center",
			end: "justify-end",
			between: "justify-between",
			around: "justify-around",
			evenly: "justify-evenly",
		},
		wrap: {
			nowrap: "flex-nowrap",
			wrap: "flex-wrap",
			wrapReverse: "flex-wrap-reverse",
		},
		gap: {
			none: "gap-0",
			xs: "gap-1",
			sm: "gap-2",
			md: "gap-4",
			lg: "gap-6",
			xl: "gap-8",
		},
	},
	defaultVariants: {
		direction: "row",
		align: "stretch",
		justify: "start",
		wrap: "nowrap",
		gap: "none",
	},
});

export type FlexProps = {
	children?: JSX.Element;
	class?: string;
} & VariantProps<typeof flexVariants> &
	JSX.HTMLAttributes<HTMLDivElement>;

export const Flex = (props: FlexProps) => {
	const [local, others] = splitProps(props, [
		"children",
		"class",
		"direction",
		"align",
		"justify",
		"wrap",
		"gap",
	]);

	return (
		<div
			class={cn(
				flexVariants({
					direction: local.direction,
					align: local.align,
					justify: local.justify,
					wrap: local.wrap,
					gap: local.gap,
				}),
				local.class,
			)}
			{...(others as JSX.HTMLAttributes<HTMLDivElement>)}
		>
			{local.children}
		</div>
	);
};

import { cva, type VariantProps } from "class-variance-authority";
import type { JSX } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "@/lib/utils";

const skeletonVariants = cva(
	["animate-pulse", "bg-surface-alt", "dark:bg-surface-dark-alt"],
	{
		variants: {
			variant: {
				text: ["rounded-radius", "h-4", "w-full"],
				circular: ["rounded-full"],
				rectangular: ["rounded-radius"],
			},
		},
		defaultVariants: {
			variant: "text",
		},
	},
);

export type SkeletonProps = {
	/** Shape variant */
	variant?: VariantProps<typeof skeletonVariants>["variant"];
	/** Custom width (e.g., "100px", "50%", "full") */
	width?: string;
	/** Custom height (e.g., "20px", "1rem") */
	height?: string;
	/** Additional CSS classes */
	class?: string;
} & Omit<JSX.IntrinsicElements["div"], "children">;

export const Skeleton = (props: SkeletonProps) => {
	const [local, others] = splitProps(props, [
		"variant",
		"width",
		"height",
		"class",
		"style",
	]);

	const style = (): JSX.CSSProperties => {
		const baseStyle = typeof local.style === "object" ? local.style : {};
		return {
			...baseStyle,
			...(local.width && { width: local.width }),
			...(local.height && { height: local.height }),
		};
	};

	return (
		<div
			class={cn(skeletonVariants({ variant: local.variant }), local.class)}
			style={style()}
			aria-hidden="true"
			{...others}
		/>
	);
};

import { cva, type VariantProps } from "class-variance-authority";
import type { JSX } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "@/lib/utils";

const iconVariants = cva(["inline-block", "shrink-0"], {
	variants: {
		size: {
			xs: ["w-3", "h-3"],
			sm: ["w-4", "h-4"],
			md: ["w-5", "h-5"],
			lg: ["w-6", "h-6"],
			xl: ["w-8", "h-8"],
		},
	},
	defaultVariants: {
		size: "md",
	},
});

export { iconVariants };

export type IconProps = Omit<JSX.SvgSVGAttributes<SVGSVGElement>, "children"> &
	VariantProps<typeof iconVariants> & {
		children: JSX.Element;
		title?: string;
	};

export const Icon = (props: IconProps) => {
	const [local, others] = splitProps(props, [
		"size",
		"class",
		"children",
		"title",
	]);

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class={cn(iconVariants({ size: local.size }), local.class)}
			aria-hidden={!local.title}
			role={local.title ? "img" : undefined}
			{...others}
		>
			{local.title && <title>{local.title}</title>}
			{local.children}
		</svg>
	);
};

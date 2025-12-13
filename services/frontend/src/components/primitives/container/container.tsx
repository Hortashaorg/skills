import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

const containerVariants = cva(["mx-auto", "px-4", "sm:px-6", "lg:px-8"], {
	variants: {
		size: {
			sm: "max-w-3xl",
			md: "max-w-5xl",
			lg: "max-w-7xl",
			xl: "max-w-350",
			full: "max-w-full",
		},
	},
	defaultVariants: {
		size: "lg",
	},
});

export type ContainerProps = {
	children?: JSX.Element;
	class?: string;
} & VariantProps<typeof containerVariants> &
	JSX.HTMLAttributes<HTMLDivElement>;

export const Container = (props: ContainerProps) => {
	const [local, others] = splitProps(props, ["children", "class", "size"]);

	return (
		<div
			class={cn(containerVariants({ size: local.size }), local.class)}
			{...(others as JSX.HTMLAttributes<HTMLDivElement>)}
		>
			{local.children}
		</div>
	);
};

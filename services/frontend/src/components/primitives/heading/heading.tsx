import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { cn } from "@/lib/utils";

const headingVariants = cva("font-title font-semibold", {
	variants: {
		level: {
			h1: "text-2xl sm:text-3xl",
			h2: "text-xl sm:text-2xl",
			h3: "text-lg sm:text-xl",
			h4: "text-base sm:text-lg",
			h5: "text-sm sm:text-base",
			h6: "text-xs sm:text-sm",
		},
		color: {
			default: "text-on-surface-strong dark:text-on-surface-dark-strong",
			primary: "text-primary dark:text-primary-dark",
			muted: "text-on-surface dark:text-on-surface-dark",
		},
	},
	defaultVariants: {
		level: "h2",
		color: "default",
	},
});

export type HeadingProps = {
	as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
	children?: JSX.Element;
	class?: string;
} & VariantProps<typeof headingVariants> &
	JSX.HTMLAttributes<HTMLHeadingElement>;

export const Heading = (props: HeadingProps) => {
	const [local, others] = splitProps(props, [
		"as",
		"children",
		"class",
		"level",
		"color",
	]);

	const element = local.as ?? local.level ?? "h2";

	return (
		<Dynamic
			component={element}
			class={cn(
				headingVariants({
					level: local.level ?? local.as ?? "h2",
					color: local.color,
				}),
				local.class,
			)}
			{...(others as JSX.HTMLAttributes<HTMLHeadingElement>)}
		>
			{local.children}
		</Dynamic>
	);
};

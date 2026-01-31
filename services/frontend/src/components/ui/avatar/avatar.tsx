import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
	[
		"inline-flex",
		"items-center",
		"justify-center",
		"rounded-full",
		"font-medium",
		"shrink-0",
		"select-none",
	],
	{
		variants: {
			variant: {
				primary: [
					"bg-primary/20",
					"text-primary",
					"dark:bg-primary-dark/20",
					"dark:text-primary-dark",
				],
				secondary: [
					"bg-secondary/20",
					"text-secondary",
					"dark:bg-secondary-dark/20",
					"dark:text-secondary-dark",
				],
				muted: [
					"bg-surface-alt",
					"text-on-surface-muted",
					"dark:bg-surface-dark-alt",
					"dark:text-on-surface-dark-muted",
				],
			},
			size: {
				sm: ["w-8", "h-8", "text-xs"],
				md: ["w-10", "h-10", "text-sm"],
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
		},
	},
);

export type AvatarProps = Omit<JSX.IntrinsicElements["div"], "children"> &
	VariantProps<typeof avatarVariants> & {
		initials: string;
	};

export const Avatar = (props: AvatarProps) => {
	const [local, others] = splitProps(props, [
		"variant",
		"size",
		"class",
		"initials",
	]);

	return (
		<div
			class={cn(
				avatarVariants({ variant: local.variant, size: local.size }),
				local.class,
			)}
			aria-hidden="true"
			{...others}
		>
			{local.initials}
		</div>
	);
};

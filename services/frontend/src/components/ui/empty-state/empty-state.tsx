import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, Show, splitProps } from "solid-js";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { cn } from "@/lib/utils";

const emptyStateVariants = cva(
	["flex", "flex-col", "items-center", "justify-center", "text-center"],
	{
		variants: {
			size: {
				sm: "py-6 gap-2",
				md: "py-10 gap-3",
				lg: "py-16 gap-4",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

const iconVariants = cva(
	["text-on-surface-muted", "dark:text-on-surface-dark-muted"],
	{
		variants: {
			size: {
				sm: "w-8 h-8",
				md: "w-12 h-12",
				lg: "w-16 h-16",
			},
		},
		defaultVariants: {
			size: "md",
		},
	},
);

export type EmptyStateProps = {
	icon?: JSX.Element;
	title: string;
	description?: string;
	action?: JSX.Element;
	class?: string;
} & VariantProps<typeof emptyStateVariants>;

export const EmptyState = (props: EmptyStateProps) => {
	const [local, others] = splitProps(props, [
		"icon",
		"title",
		"description",
		"action",
		"class",
		"size",
	]);

	return (
		<div
			class={cn(emptyStateVariants({ size: local.size }), local.class)}
			{...others}
		>
			<Show when={local.icon}>
				<div class={iconVariants({ size: local.size })}>{local.icon}</div>
			</Show>
			<Stack spacing="xs" align="center">
				<Text
					size={
						local.size === "lg" ? "lg" : local.size === "sm" ? "sm" : "base"
					}
					weight="medium"
					color="default"
				>
					{local.title}
				</Text>
				<Show when={local.description}>
					<Text
						size={local.size === "lg" ? "base" : "sm"}
						color="muted"
						class="max-w-sm"
					>
						{local.description}
					</Text>
				</Show>
			</Stack>
			<Show when={local.action}>
				<div class="mt-2">{local.action}</div>
			</Show>
		</div>
	);
};

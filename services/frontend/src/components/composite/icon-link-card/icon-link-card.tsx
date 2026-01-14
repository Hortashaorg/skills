import { A } from "@solidjs/router";
import { cva, type VariantProps } from "class-variance-authority";
import type { JSX } from "solid-js";
import { Flex } from "@/components/primitives/flex";
import { Text } from "@/components/primitives/text";
import { cn } from "@/lib/utils";

const linkStyles = cn(
	"block p-4 rounded-radius border border-outline dark:border-outline-dark",
	"hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition",
);

const iconWrapperVariants = cva("p-2 rounded-radius", {
	variants: {
		color: {
			primary: "bg-primary/10 dark:bg-primary-dark/10",
			secondary: "bg-secondary/10 dark:bg-secondary-dark/10",
			info: "bg-info/10",
			success: "bg-success/10",
			warning: "bg-warning/10",
			danger: "bg-danger/10",
		},
	},
	defaultVariants: {
		color: "primary",
	},
});

const iconVariants = cva("w-6 h-6", {
	variants: {
		color: {
			primary: "text-primary dark:text-primary-dark",
			secondary: "text-secondary dark:text-secondary-dark",
			info: "text-info",
			success: "text-success",
			warning: "text-warning",
			danger: "text-danger",
		},
	},
	defaultVariants: {
		color: "primary",
	},
});

export type IconLinkCardProps = {
	href: string;
	title: string;
	description: string | JSX.Element;
	icon: JSX.Element;
	external?: boolean;
	class?: string;
} & VariantProps<typeof iconWrapperVariants>;

export const IconLinkCard = (props: IconLinkCardProps) => {
	const content = () => (
		<Flex align="center" gap="md">
			<div class={iconWrapperVariants({ color: props.color })}>
				<div class={iconVariants({ color: props.color })}>{props.icon}</div>
			</div>
			<div class="min-w-0">
				<Text weight="semibold" class="truncate">
					{props.title}
				</Text>
				<Text size="sm" color="muted" class="line-clamp-1">
					{props.description}
				</Text>
			</div>
		</Flex>
	);

	if (props.external) {
		return (
			<a
				href={props.href}
				target="_blank"
				rel="noopener noreferrer"
				class={cn(linkStyles, props.class)}
			>
				{content()}
			</a>
		);
	}

	return (
		<A href={props.href} class={cn(linkStyles, props.class)}>
			{content()}
		</A>
	);
};

import {
	Collapsible as CollapsiblePrimitive,
	type CollapsibleContentProps as KobalteContentProps,
	type CollapsibleRootProps as KobalteRootProps,
	type CollapsibleTriggerProps as KobalteTriggerProps,
} from "@kobalte/core/collapsible";
import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, splitProps } from "solid-js";
import { ChevronDownIcon } from "@/components/primitives/icon";
import { cn } from "@/lib/utils";

const collapsibleTriggerVariants = cva(
	[
		"flex",
		"w-full",
		"items-center",
		"justify-between",
		"font-medium",
		"transition-colors",
		"rounded-radius",
		"text-on-surface-strong",
		"dark:text-on-surface-dark-strong",
		"hover:bg-surface-alt",
		"dark:hover:bg-surface-dark-alt",
		"focus-visible:outline-2",
		"focus-visible:outline-offset-2",
		"focus-visible:outline-primary",
		"dark:focus-visible:outline-primary-dark",
		"cursor-pointer",
		"[&[data-expanded]>svg]:rotate-180",
	],
	{
		variants: {
			size: {
				default: ["px-4", "py-3", "text-sm", "gap-3"],
				compact: ["px-2", "py-1.5", "text-xs", "gap-2"],
			},
		},
		defaultVariants: {
			size: "default",
		},
	},
);

const collapsibleContentVariants = cva(
	["overflow-hidden", "text-on-surface", "dark:text-on-surface-dark"],
	{
		variants: {
			size: {
				default: ["px-4", "pb-3", "text-sm"],
				compact: ["px-2", "pb-1.5", "text-xs"],
			},
		},
		defaultVariants: {
			size: "default",
		},
	},
);

export type CollapsibleRootProps = {
	children?: JSX.Element;
	class?: string;
	/** Whether the collapsible is open by default (uncontrolled) */
	defaultOpen?: boolean;
	/** Controlled open state */
	open?: boolean;
	/** Callback when open state changes */
	onOpenChange?: (open: boolean) => void;
	/** Disable the collapsible */
	disabled?: boolean;
} & VariantProps<typeof collapsibleTriggerVariants>;

export type CollapsibleTriggerProps = {
	children?: JSX.Element;
	class?: string;
} & VariantProps<typeof collapsibleTriggerVariants>;

export type CollapsibleContentProps = {
	children?: JSX.Element;
	class?: string;
} & VariantProps<typeof collapsibleContentVariants>;

const CollapsibleRoot = (props: CollapsibleRootProps) => {
	const [local, others] = splitProps(props, [
		"children",
		"class",
		"defaultOpen",
		"open",
		"onOpenChange",
		"disabled",
		"size",
	]);

	return (
		<CollapsiblePrimitive
			class={cn("w-full", local.class)}
			defaultOpen={local.defaultOpen}
			open={local.open}
			onOpenChange={local.onOpenChange}
			disabled={local.disabled}
			{...(others as KobalteRootProps)}
		>
			{local.children}
		</CollapsiblePrimitive>
	);
};

const CollapsibleTrigger = (props: CollapsibleTriggerProps) => {
	const [local, others] = splitProps(props, ["children", "class", "size"]);

	return (
		<CollapsiblePrimitive.Trigger
			class={cn(collapsibleTriggerVariants({ size: local.size }), local.class)}
			{...(others as KobalteTriggerProps)}
		>
			{local.children}
			<ChevronDownIcon
				size="sm"
				class="shrink-0 transition-transform duration-200"
			/>
		</CollapsiblePrimitive.Trigger>
	);
};

const CollapsibleContent = (props: CollapsibleContentProps) => {
	const [local, others] = splitProps(props, ["children", "class", "size"]);

	return (
		<CollapsiblePrimitive.Content
			class={cn(collapsibleContentVariants({ size: local.size }), local.class)}
			{...(others as KobalteContentProps)}
		>
			{local.children}
		</CollapsiblePrimitive.Content>
	);
};

export const Collapsible = {
	Root: CollapsibleRoot,
	Trigger: CollapsibleTrigger,
	Content: CollapsibleContent,
};

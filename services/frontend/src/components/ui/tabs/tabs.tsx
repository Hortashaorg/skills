import { Tabs as TabsPrimitive } from "@kobalte/core/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { type JSX, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

const tabsListVariants = cva(
	[
		"inline-flex",
		"items-center",
		"gap-1",
		"rounded-radius",
		"p-1",
		"text-on-surface-muted",
		"dark:text-on-surface-dark-muted",
	],
	{
		variants: {
			variant: {
				line: [
					"bg-transparent",
					"border-b",
					"border-outline",
					"dark:border-outline-dark",
					"rounded-none",
					"p-0",
					"gap-0",
				],
				pills: ["bg-surface-alt", "dark:bg-surface-dark-alt"],
			},
		},
		defaultVariants: {
			variant: "line",
		},
	},
);

const tabsTriggerVariants = cva(
	[
		"inline-flex",
		"items-center",
		"justify-center",
		"whitespace-nowrap",
		"font-medium",
		"transition-all",
		"focus-visible:outline-2",
		"focus-visible:outline-offset-2",
		"focus-visible:outline-primary",
		"dark:focus-visible:outline-primary-dark",
		"disabled:pointer-events-none",
		"disabled:opacity-50",
	],
	{
		variants: {
			variant: {
				line: [
					"border-b-2",
					"border-transparent",
					"pb-2",
					"pt-2",
					"px-4",
					"-mb-px",
					"text-on-surface-muted",
					"dark:text-on-surface-dark-muted",
					"hover:text-on-surface",
					"dark:hover:text-on-surface-dark",
					"ui-selected:border-primary",
					"dark:ui-selected:border-primary-dark",
					"ui-selected:text-on-surface-strong",
					"dark:ui-selected:text-on-surface-dark-strong",
				],
				pills: [
					"rounded-radius",
					"px-3",
					"py-1.5",
					"text-on-surface-muted",
					"dark:text-on-surface-dark-muted",
					"hover:text-on-surface",
					"dark:hover:text-on-surface-dark",
					"ui-selected:bg-surface",
					"dark:ui-selected:bg-surface-dark",
					"ui-selected:text-on-surface-strong",
					"dark:ui-selected:text-on-surface-dark-strong",
					"ui-selected:shadow-sm",
				],
			},
			size: {
				sm: ["text-xs"],
				md: ["text-sm"],
				lg: ["text-base"],
			},
		},
		defaultVariants: {
			variant: "line",
			size: "md",
		},
	},
);

const tabsContentVariants = cva(
	[
		"mt-2",
		"focus-visible:outline-2",
		"focus-visible:outline-offset-2",
		"focus-visible:outline-primary",
		"dark:focus-visible:outline-primary-dark",
	],
	{
		variants: {},
		defaultVariants: {},
	},
);

export type TabsProps = {
	children?: JSX.Element;
	class?: string;
	/** The value of the tab to select by default */
	defaultValue?: string;
	/** The controlled value of the currently selected tab */
	value?: string;
	/** Callback when the selected tab changes */
	onChange?: (value: string) => void;
	/** The orientation of the tabs */
	orientation?: "horizontal" | "vertical";
	/** Whether the tabs are disabled */
	disabled?: boolean;
} & VariantProps<typeof tabsListVariants>;

export type TabsListProps = {
	children?: JSX.Element;
	class?: string;
} & VariantProps<typeof tabsListVariants>;

export type TabsTriggerProps = {
	children?: JSX.Element;
	class?: string;
	/** The unique value for this tab */
	value: string;
	/** Whether the tab is disabled */
	disabled?: boolean;
} & VariantProps<typeof tabsTriggerVariants>;

export type TabsContentProps = {
	children?: JSX.Element;
	class?: string;
	/** The value of the tab this content is associated with */
	value: string;
};

const TabsRoot = (props: TabsProps) => {
	const [local, others] = splitProps(props, [
		"children",
		"class",
		"defaultValue",
		"value",
		"onChange",
		"orientation",
		"disabled",
		"variant",
	]);

	return (
		<TabsPrimitive
			class={cn("w-full", local.class)}
			defaultValue={local.defaultValue}
			value={local.value}
			onChange={local.onChange}
			orientation={local.orientation}
			disabled={local.disabled}
			{...others}
		>
			{local.children}
		</TabsPrimitive>
	);
};

const TabsList = (props: TabsListProps) => {
	const [local, others] = splitProps(props, ["children", "class", "variant"]);

	return (
		<TabsPrimitive.List
			class={cn(tabsListVariants({ variant: local.variant }), local.class)}
			{...others}
		>
			{local.children}
		</TabsPrimitive.List>
	);
};

const TabsTrigger = (props: TabsTriggerProps) => {
	const [local, others] = splitProps(props, [
		"children",
		"class",
		"value",
		"disabled",
		"variant",
		"size",
	]);

	return (
		<TabsPrimitive.Trigger
			class={cn(
				tabsTriggerVariants({ variant: local.variant, size: local.size }),
				local.class,
			)}
			value={local.value}
			disabled={local.disabled}
			{...others}
		>
			{local.children}
		</TabsPrimitive.Trigger>
	);
};

const TabsContent = (props: TabsContentProps) => {
	const [local, others] = splitProps(props, ["children", "class", "value"]);

	return (
		<TabsPrimitive.Content
			class={cn(tabsContentVariants({}), local.class)}
			value={local.value}
			{...others}
		>
			{local.children}
		</TabsPrimitive.Content>
	);
};

export const Tabs = {
	Root: TabsRoot,
	List: TabsList,
	Trigger: TabsTrigger,
	Content: TabsContent,
};

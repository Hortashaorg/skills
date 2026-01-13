import { DropdownMenu as DropdownMenuPrimitive } from "@kobalte/core/dropdown-menu";
import type { JSX } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "@/lib/utils";

const widthClasses = {
	auto: "",
	sm: "w-44",
	md: "w-64",
	lg: "w-80",
};

export type DropdownWidth = keyof typeof widthClasses;

const Root = (props: { children: JSX.Element; modal?: boolean }) => {
	return (
		<DropdownMenuPrimitive modal={props.modal ?? false}>
			{props.children}
		</DropdownMenuPrimitive>
	);
};

type TriggerProps = {
	children: JSX.Element;
	class?: string;
	"aria-label"?: string;
};

const Trigger = (props: TriggerProps) => {
	return (
		<DropdownMenuPrimitive.Trigger
			class={cn("cursor-pointer outline-none", props.class)}
			aria-label={props["aria-label"]}
		>
			{props.children}
		</DropdownMenuPrimitive.Trigger>
	);
};

type ContentProps = {
	children: JSX.Element;
	class?: string;
	width?: DropdownWidth;
};

const Content = (props: ContentProps) => {
	const width = () => props.width ?? "auto";

	return (
		<DropdownMenuPrimitive.Portal>
			<DropdownMenuPrimitive.Content
				class={cn(
					"z-50 overflow-hidden p-1",
					"bg-surface dark:bg-surface-dark",
					"border border-outline dark:border-outline-dark",
					"rounded-lg shadow-lg",
					"origin-(--kb-menu-content-transform-origin)",
					"animate-in fade-in-0 zoom-in-95",
					widthClasses[width()],
					props.class,
				)}
			>
				{props.children}
			</DropdownMenuPrimitive.Content>
		</DropdownMenuPrimitive.Portal>
	);
};

type ItemProps = {
	children: JSX.Element;
	class?: string;
	onSelect?: () => void;
	disabled?: boolean;
	closeOnSelect?: boolean;
};

const Item = (props: ItemProps) => {
	const [local, others] = splitProps(props, [
		"class",
		"children",
		"onSelect",
		"disabled",
		"closeOnSelect",
	]);

	return (
		<DropdownMenuPrimitive.Item
			class={cn(
				"block w-full text-left px-3 py-2 text-sm rounded-md",
				"text-on-surface dark:text-on-surface-dark",
				"hover:bg-surface-alt dark:hover:bg-surface-dark-alt",
				"focus:bg-surface-alt dark:focus:bg-surface-dark-alt",
				"outline-none transition-all duration-200 cursor-pointer",
				"disabled:opacity-50 disabled:cursor-not-allowed",
				local.class,
			)}
			onSelect={local.onSelect}
			disabled={local.disabled}
			closeOnSelect={local.closeOnSelect}
			{...others}
		>
			{local.children}
		</DropdownMenuPrimitive.Item>
	);
};

type LinkItemProps = {
	children: JSX.Element;
	href: string;
	class?: string;
	active?: boolean;
	onClick?: () => void;
};

const LinkItem = (props: LinkItemProps) => {
	const [local, others] = splitProps(props, [
		"class",
		"children",
		"href",
		"active",
		"onClick",
	]);

	return (
		<DropdownMenuPrimitive.Item
			as="a"
			href={local.href}
			class={cn(
				"block w-full text-left px-3 py-2 text-sm rounded-md",
				"outline-none transition-all duration-200 cursor-pointer",
				local.active
					? "bg-brand/10 dark:bg-brand-dark/15 text-brand dark:text-brand-dark font-medium"
					: "text-on-surface dark:text-on-surface-dark hover:bg-surface-alt dark:hover:bg-surface-dark-alt",
				local.class,
			)}
			closeOnSelect={true}
			onSelect={local.onClick}
			{...others}
		>
			{local.children}
		</DropdownMenuPrimitive.Item>
	);
};

const Separator = (props: { class?: string }) => {
	return (
		<DropdownMenuPrimitive.Separator
			class={cn(
				"border-t border-outline dark:border-outline-dark my-1 -mx-1",
				props.class,
			)}
		/>
	);
};

const Group = DropdownMenuPrimitive.Group;

const GroupLabel = (props: { children: JSX.Element; class?: string }) => {
	return (
		<DropdownMenuPrimitive.GroupLabel
			class={cn(
				"px-3 py-2 text-xs text-on-surface-muted dark:text-on-surface-dark-muted uppercase tracking-wide",
				props.class,
			)}
		>
			{props.children}
		</DropdownMenuPrimitive.GroupLabel>
	);
};

export const Dropdown = Object.assign(Root, {
	Trigger,
	Content,
	Item,
	LinkItem,
	Separator,
	Group,
	GroupLabel,
});

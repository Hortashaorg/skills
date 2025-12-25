import { Breadcrumbs as BreadcrumbsPrimitive } from "@kobalte/core/breadcrumbs";
import { A } from "@solidjs/router";
import { type JSX, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

export type BreadcrumbsRootProps = {
	children?: JSX.Element;
	class?: string;
	separator?: JSX.Element;
	"aria-label"?: string;
};

export type BreadcrumbsLinkProps = {
	children?: JSX.Element;
	class?: string;
	href?: string;
	current?: boolean;
};

export type BreadcrumbsSeparatorProps = {
	children?: JSX.Element;
	class?: string;
};

const DefaultSeparator = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		class="mx-1 text-on-surface-muted dark:text-on-surface-dark-muted"
	>
		<path d="m9 18 6-6-6-6" />
	</svg>
);

const BreadcrumbsRoot = (props: BreadcrumbsRootProps) => {
	const [local, others] = splitProps(props, ["children", "class", "separator"]);

	return (
		<BreadcrumbsPrimitive
			class={cn(
				"text-sm text-on-surface-muted dark:text-on-surface-dark-muted",
				local.class,
			)}
			separator={local.separator ?? <DefaultSeparator />}
			{...others}
		>
			<ol class="flex items-center gap-1 list-none m-0 p-0">
				{local.children}
			</ol>
		</BreadcrumbsPrimitive>
	);
};

const BreadcrumbsLink = (props: BreadcrumbsLinkProps) => {
	const [local, others] = splitProps(props, [
		"children",
		"class",
		"href",
		"current",
	]);

	const baseClasses = cn(
		"inline-flex items-center transition-colors",
		local.current
			? "text-on-surface-strong dark:text-on-surface-dark-strong font-medium cursor-default"
			: "text-on-surface-muted dark:text-on-surface-dark-muted hover:text-on-surface dark:hover:text-on-surface-dark",
		local.class,
	);

	return (
		<li class="flex items-center" {...others}>
			{local.href && !local.current ? (
				<A href={local.href} class={baseClasses}>
					{local.children}
				</A>
			) : (
				<span
					class={baseClasses}
					aria-current={local.current ? "page" : undefined}
				>
					{local.children}
				</span>
			)}
		</li>
	);
};

const BreadcrumbsSeparator = (props: BreadcrumbsSeparatorProps) => {
	const [local, others] = splitProps(props, ["children", "class"]);

	return (
		<BreadcrumbsPrimitive.Separator
			class={cn(
				"mx-1 text-on-surface-muted dark:text-on-surface-dark-muted select-none",
				local.class,
			)}
			{...others}
		>
			{local.children ?? <DefaultSeparator />}
		</BreadcrumbsPrimitive.Separator>
	);
};

export const Breadcrumbs = {
	Root: BreadcrumbsRoot,
	Link: BreadcrumbsLink,
	Separator: BreadcrumbsSeparator,
};

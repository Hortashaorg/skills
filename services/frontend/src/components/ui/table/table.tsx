import type { JSX } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "@/lib/utils";

export type TableProps = JSX.IntrinsicElements["table"];

const TableRoot = (props: TableProps) => {
	const [local, others] = splitProps(props, ["class", "children"]);
	return (
		<div class="overflow-x-auto">
			<table
				class={cn(
					"w-full text-sm text-on-surface dark:text-on-surface-dark",
					local.class,
				)}
				{...others}
			>
				{local.children}
			</table>
		</div>
	);
};

export type TableHeaderProps = JSX.IntrinsicElements["thead"];

const TableHeader = (props: TableHeaderProps) => {
	const [local, others] = splitProps(props, ["class"]);
	return <thead class={cn(local.class)} {...others} />;
};

export type TableBodyProps = JSX.IntrinsicElements["tbody"];

const TableBody = (props: TableBodyProps) => {
	const [local, others] = splitProps(props, ["class"]);
	return <tbody class={cn(local.class)} {...others} />;
};

export type TableRowProps = JSX.IntrinsicElements["tr"] & {
	/** Whether this is a header row (adds bottom border) */
	header?: boolean;
	/** Whether the row should highlight on hover */
	hoverable?: boolean;
};

const TableRow = (props: TableRowProps) => {
	const [local, others] = splitProps(props, ["class", "header", "hoverable"]);
	return (
		<tr
			class={cn(
				local.header
					? "border-b border-outline dark:border-outline-dark"
					: "border-b border-outline/50 dark:border-outline-dark/50",
				local.hoverable &&
					"hover:bg-surface-alt/50 dark:hover:bg-surface-dark-alt/50",
				local.class,
			)}
			{...others}
		/>
	);
};

export type TableHeadProps = JSX.IntrinsicElements["th"] & {
	/** Text alignment */
	align?: "left" | "center" | "right";
};

const TableHead = (props: TableHeadProps) => {
	const [local, others] = splitProps(props, ["class", "align"]);
	return (
		<th
			class={cn(
				"py-3 px-2 font-medium",
				"text-on-surface-muted dark:text-on-surface-dark-muted",
				local.align === "right"
					? "text-right"
					: local.align === "center"
						? "text-center"
						: "text-left",
				local.class,
			)}
			{...others}
		/>
	);
};

export type TableCellProps = JSX.IntrinsicElements["td"] & {
	/** Text alignment */
	align?: "left" | "center" | "right";
};

const TableCell = (props: TableCellProps) => {
	const [local, others] = splitProps(props, ["class", "align"]);
	return (
		<td
			class={cn(
				"py-3 px-2",
				local.align === "right"
					? "text-right"
					: local.align === "center"
						? "text-center"
						: "text-left",
				local.class,
			)}
			{...others}
		/>
	);
};

export const Table = Object.assign(TableRoot, {
	Header: TableHeader,
	Body: TableBody,
	Row: TableRow,
	Head: TableHead,
	Cell: TableCell,
});

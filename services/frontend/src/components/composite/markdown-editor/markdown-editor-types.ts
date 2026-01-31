import type { JSX } from "solid-js";

export type InsertFn = (text: string) => void;

export type ToolbarContext = {
	insert: InsertFn;
	closePanel: () => void;
};

export type ToolbarModule = {
	id: string;
	label: string;
	icon?: JSX.Element;
	panel?: (ctx: ToolbarContext) => JSX.Element;
	action?: (ctx: ToolbarContext) => void;
};

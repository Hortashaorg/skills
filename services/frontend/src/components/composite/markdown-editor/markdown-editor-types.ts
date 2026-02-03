import type { JSX } from "solid-js";

export type ToolbarContext = {
	insert: (text: string) => void;
	insertBlock: (block: string) => void;
	wrap: (options: { prefix: string; suffix: string }) => void;
	closePanel: () => void;
};

export type ToolbarModule = {
	id: string;
	label: string;
	icon?: () => JSX.Element;
	panel?: (ctx: ToolbarContext) => JSX.Element;
	action?: (ctx: ToolbarContext) => void;
};

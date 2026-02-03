import type { JSX } from "solid-js";

export type ToolbarContext = {
	insert: (text: string) => void;
	insertBlock: (block: string) => void;
	wrap: (options: { prefix: string; suffix: string }) => void;
	undo: () => boolean;
	redo: () => boolean;
	closePanel: () => void;
};

export type Shortcut = { key: string; ctrl?: boolean; shift?: boolean };

export type ToolbarModule = {
	id: string;
	label: string;
	shortcut?: Shortcut | Shortcut[];
	icon?: () => JSX.Element;
	panel?: (ctx: ToolbarContext) => JSX.Element;
	action?: (ctx: ToolbarContext) => void;
};

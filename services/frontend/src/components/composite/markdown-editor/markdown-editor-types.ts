import type { JSX } from "solid-js";

export type ToolbarContext = {
	insert: (text: string) => void;
	insertBlock: (block: string) => void;
	wrap: (options: { prefix: string; suffix: string }) => void;
	indent: (prefix?: string) => void;
	outdent: (prefix?: string) => void;
	undo: () => boolean;
	redo: () => boolean;
	getSelectedText: () => string;
	closePanel: () => void;
};

export type Shortcut = { key: string; ctrl?: boolean; shift?: boolean };

export type ToolbarModule = {
	id: string;
	label: string;
	shortcut?: Shortcut | Shortcut[];
	icon?: () => JSX.Element;
	panel?: (ctx: ToolbarContext) => JSX.Element;
	/** Return true if action was fully handled, otherwise opens panel (if exists) */
	action?: (ctx: ToolbarContext) => unknown;
};

export type ToolbarSeparator = { separator: true };

export type ToolbarItem = ToolbarModule | ToolbarSeparator;

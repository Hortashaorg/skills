import type { Accessor, JSX } from "solid-js";
import type {
	UseEcosystemSearchResult,
	UsePackageSearchResult,
	UseProjectSearchResult,
	UseUserSearchResult,
} from "@/hooks/useEntities";
import type { Ecosystem, Package, Project, User } from "./entity-types";

// ─────────────────────────────────────────────────────────────────────────────
// Entity types for MarkdownEditor (search) and MarkdownOutput (byIds)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Search hooks for MarkdownEditor modules.
 * Used to show dropdowns for inserting entity references.
 */
export type EntitySearch = {
	packages: UsePackageSearchResult;
	ecosystems: UseEcosystemSearchResult;
	projects: UseProjectSearchResult;
	users: UseUserSearchResult;
};

/**
 * ByIds results for MarkdownOutput.
 * Used to resolve entity tokens ($$user:id, $$package:id, etc.) to display data.
 */
export type EntityByIds = {
	packages: Accessor<Map<string, Package>>;
	ecosystems: Accessor<Map<string, Ecosystem>>;
	projects: Accessor<Map<string, Project>>;
	users: Accessor<Map<string, User>>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Toolbar types
// ─────────────────────────────────────────────────────────────────────────────

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

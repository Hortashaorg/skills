import type { ToolbarItem } from "../markdown-editor-types";
import { boldModule } from "./bold";
import { checklistModule } from "./checklist";
import { codeModule } from "./code";
import { indentModule, outdentModule } from "./indent";
import { italicModule } from "./italic";
import { linkModule } from "./link";
import { quoteModule } from "./quote";
import { redoModule, undoModule } from "./undo";

const separator: ToolbarItem = { separator: true };

export const defaultModules: ToolbarItem[] = [
	// History
	undoModule,
	redoModule,
	separator,
	// Formatting
	boldModule,
	italicModule,
	separator,
	// Insert
	linkModule,
	codeModule,
	quoteModule,
	checklistModule,
	separator,
	// Indentation
	indentModule,
	outdentModule,
];

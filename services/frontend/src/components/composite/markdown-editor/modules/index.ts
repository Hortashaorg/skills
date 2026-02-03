import { boldModule } from "./bold";
import { codeModule } from "./code";
import { italicModule } from "./italic";
import { linkModule } from "./link";
import { quoteModule } from "./quote";
import { redoModule, undoModule } from "./undo";

export const defaultModules = [
	undoModule,
	redoModule,
	boldModule,
	italicModule,
	linkModule,
	codeModule,
	quoteModule,
];

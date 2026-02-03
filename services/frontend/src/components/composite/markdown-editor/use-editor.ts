import { createSignal } from "solid-js";
import type { Shortcut, ToolbarModule } from "./markdown-editor-types";
import { createUndoStack } from "./undo-stack";

export type WrapOptions = {
	prefix: string;
	suffix: string;
};

type Options = {
	debug?: boolean;
};

function matchesShortcut(e: KeyboardEvent, shortcut: Shortcut | Shortcut[]) {
	const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut];
	return shortcuts.some(
		(s) =>
			e.key.toLowerCase() === s.key.toLowerCase() &&
			(e.ctrlKey || e.metaKey) === (s.ctrl ?? false) &&
			e.shiftKey === (s.shift ?? false),
	);
}

function clamp(n: number, min: number, max: number) {
	return Math.max(min, Math.min(n, max));
}

export function useEditor(options?: Options) {
	const debug = options?.debug ?? false;
	const undoStack = createUndoStack();

	const log = (...args: unknown[]) => {
		if (debug) console.log("[textarea-utility]", ...args);
	};

	// ──────────────────────────────────────────────────────────────────────────
	// State tracking: ref, selection, and event handlers to keep them in sync
	// ──────────────────────────────────────────────────────────────────────────

	const [textareaRef, _setTextareaRef] = createSignal<HTMLTextAreaElement>();

	const setTextareaRef = (el: HTMLTextAreaElement) => {
		const wasSet = !!textareaRef();
		_setTextareaRef(el);
		return wasSet;
	};
	const [selection, setSelection] = createSignal({ start: 0, end: 0 });

	const captureSelection = (el: HTMLTextAreaElement) => {
		const next = { start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0 };
		const prev = selection();
		if (prev.start !== next.start || prev.end !== next.end) {
			log("selection", next, `"${el.value.slice(next.start, next.end)}"`);
			setSelection(next);
		}
	};

	const restoreSelection = (el: HTMLTextAreaElement) => {
		const sel = selection();
		const max = el.value.length;
		el.setSelectionRange(clamp(sel.start, 0, max), clamp(sel.end, 0, max));
	};

	// Track undo checkpoints on word boundaries and pauses
	let pauseTimeout: ReturnType<typeof setTimeout> | null = null;

	const saveOnBoundary = (el: HTMLTextAreaElement, key: string) => {
		// Clear any pending pause save
		if (pauseTimeout) {
			clearTimeout(pauseTimeout);
			pauseTimeout = null;
		}

		// Save immediately on word boundaries
		const isBoundary = /^[\s.,!?;:\-(){}[\]"'`]$/.test(key) || key === "Enter";
		if (isBoundary) {
			undoStack.save(el);
			log("save (boundary)");
			return;
		}

		// Save after typing pause (300ms)
		pauseTimeout = setTimeout(() => {
			undoStack.save(el);
			log("save (pause)");
		}, 300);
	};

	const handlers = {
		onSelect: (e: Event & { currentTarget: HTMLTextAreaElement }) =>
			captureSelection(e.currentTarget),
		onKeyUp: (e: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) => {
			captureSelection(e.currentTarget);
			saveOnBoundary(e.currentTarget, e.key);
		},
		onMouseUp: (e: MouseEvent & { currentTarget: HTMLTextAreaElement }) => {
			captureSelection(e.currentTarget);
			// Save on click (selection change)
			undoStack.save(e.currentTarget);
			log("save (click)");
		},
	};

	// ──────────────────────────────────────────────────────────────────────────
	// Manipulation utilities: insert and wrap text at current selection
	// ──────────────────────────────────────────────────────────────────────────

	const getSelection = () => {
		const el = textareaRef();
		if (!el) return null;

		el.focus();
		restoreSelection(el);

		const start = el.selectionStart ?? 0;
		const end = el.selectionEnd ?? 0;
		return { el, start, end, text: el.value.slice(start, end) };
	};

	const applyEdit = (replacement: string) => {
		const sel = getSelection();
		if (!sel) return;

		undoStack.save(sel.el);
		sel.el.setRangeText(replacement, sel.start, sel.end, "end");
		log("applyEdit", { replacement, start: sel.start, end: sel.end });
		captureSelection(sel.el);
		sel.el.dispatchEvent(new InputEvent("input", { bubbles: true }));
	};

	const insert = (text: string) => applyEdit(text);

	const insertBlock = (block: string) => {
		const el = textareaRef();
		if (!el) return;

		el.focus();
		restoreSelection(el);

		// Insert at end of selection (don't replace selected text)
		const pos = el.selectionEnd ?? 0;
		const before = el.value.slice(0, pos);
		const needsNewline = before.length > 0 && !before.endsWith("\n");

		const text = needsNewline ? `\n${block}` : block;
		undoStack.save(el);
		el.setRangeText(text, pos, pos, "end");
		log("insertBlock", { block, pos, needsNewline });
		captureSelection(el);
		el.dispatchEvent(new InputEvent("input", { bubbles: true }));
	};

	const wrap = (opts: WrapOptions) => {
		const sel = getSelection();
		if (!sel) return;

		const replacement = `${opts.prefix}${sel.text}${opts.suffix}`;
		undoStack.save(sel.el);
		sel.el.setRangeText(replacement, sel.start, sel.end, "end");
		log("wrap", { replacement, start: sel.start, end: sel.end });

		// Place cursor between prefix/suffix when wrapping empty selection
		const caret =
			sel.text.length === 0
				? sel.start + opts.prefix.length
				: sel.start + replacement.length;
		sel.el.setSelectionRange(caret, caret);

		captureSelection(sel.el);
		sel.el.dispatchEvent(new InputEvent("input", { bubbles: true }));
	};

	const indent = (indentStr = "\t") => {
		const el = textareaRef();
		if (!el) return;

		el.focus();
		restoreSelection(el);

		const start = el.selectionStart ?? 0;
		const end = el.selectionEnd ?? 0;
		const value = el.value;

		// Find line boundaries
		const lineStart = value.lastIndexOf("\n", start - 1) + 1;
		const lineEnd = value.indexOf("\n", end);
		const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;

		// Get all lines in selection
		const selectedText = value.slice(lineStart, actualLineEnd);
		const lines = selectedText.split("\n");

		// Indent each line
		const indented = lines.map((line) => indentStr + line).join("\n");

		undoStack.save(el);
		el.setRangeText(indented, lineStart, actualLineEnd, "select");

		// Adjust selection to cover indented text
		el.setSelectionRange(lineStart, lineStart + indented.length);

		log("indent", { lineStart, actualLineEnd, lines: lines.length });
		captureSelection(el);
		el.dispatchEvent(new InputEvent("input", { bubbles: true }));
	};

	const outdent = () => {
		const el = textareaRef();
		if (!el) return;

		el.focus();
		restoreSelection(el);

		const start = el.selectionStart ?? 0;
		const end = el.selectionEnd ?? 0;
		const value = el.value;

		// Find line boundaries
		const lineStart = value.lastIndexOf("\n", start - 1) + 1;
		const lineEnd = value.indexOf("\n", end);
		const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;

		// Get all lines in selection
		const selectedText = value.slice(lineStart, actualLineEnd);
		const lines = selectedText.split("\n");

		// Remove common prefixes: tab, 2 spaces, "> ", "- [ ] ", "- [x] ", "- "
		const prefixPattern = /^(\t| {2}|> |- \[[x ]\] |- )/;
		const outdented = lines
			.map((line) => line.replace(prefixPattern, ""))
			.join("\n");

		undoStack.save(el);
		el.setRangeText(outdented, lineStart, actualLineEnd, "select");

		// Adjust selection to cover outdented text
		el.setSelectionRange(lineStart, lineStart + outdented.length);

		log("outdent", { lineStart, actualLineEnd, lines: lines.length });
		captureSelection(el);
		el.dispatchEvent(new InputEvent("input", { bubbles: true }));
	};

	const undo = () => {
		const el = textareaRef();
		if (!el) return false;

		// Clear pending pause save
		if (pauseTimeout) {
			clearTimeout(pauseTimeout);
			pauseTimeout = null;
		}

		// Save current state if changed (captures in-progress typing)
		undoStack.save(el);

		const result = undoStack.undo(el);
		if (result) {
			log("undo");
			captureSelection(el);
		}
		return result;
	};

	const redo = () => {
		const el = textareaRef();
		if (!el) return false;
		const result = undoStack.redo(el);
		if (result) {
			log("redo");
			captureSelection(el);
		}
		return result;
	};

	// ──────────────────────────────────────────────────────────────────────────

	const saveState = () => {
		const el = textareaRef();
		if (el) undoStack.save(el);
	};

	const createKeyDownHandler =
		(
			modules: ToolbarModule[],
			createContext: () => Parameters<NonNullable<ToolbarModule["action"]>>[0],
		) =>
		(e: KeyboardEvent) => {
			for (const mod of modules) {
				if (!mod.shortcut || !mod.action) continue;
				if (matchesShortcut(e, mod.shortcut)) {
					e.preventDefault();
					mod.action(createContext());
					return;
				}
			}
		};

	const getSelectedText = () => {
		const el = textareaRef();
		if (!el) return "";
		const start = el.selectionStart ?? 0;
		const end = el.selectionEnd ?? 0;
		return el.value.slice(start, end);
	};

	return {
		setTextareaRef,
		handlers,
		mutators: { insert, insertBlock, wrap, indent, outdent },
		undo,
		redo,
		saveState,
		createKeyDownHandler,
		getSelectedText,
	};
}

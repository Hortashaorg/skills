import { createSignal } from "solid-js";

export type WrapOptions = {
	prefix: string;
	suffix: string;
};

type Options = {
	onValue: (v: string) => void;
	debug?: boolean;
};

function clamp(n: number, min: number, max: number) {
	return Math.max(min, Math.min(n, max));
}

export function useTextareaUtility(options: Options) {
	const { onValue, debug = false } = options;

	const log = (...args: unknown[]) => {
		if (debug) console.log("[textarea-utility]", ...args);
	};

	// ──────────────────────────────────────────────────────────────────────────
	// State tracking: ref, selection, and event handlers to keep them in sync
	// ──────────────────────────────────────────────────────────────────────────

	const [textareaRef, setTextareaRef] = createSignal<HTMLTextAreaElement>();
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

	const handlers = {
		onSelect: (e: Event & { currentTarget: HTMLTextAreaElement }) =>
			captureSelection(e.currentTarget),
		onKeyUp: (e: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) =>
			captureSelection(e.currentTarget),
		onMouseUp: (e: MouseEvent & { currentTarget: HTMLTextAreaElement }) =>
			captureSelection(e.currentTarget),
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

		sel.el.setRangeText(replacement, sel.start, sel.end, "end");
		log("applyEdit", { replacement, start: sel.start, end: sel.end });
		captureSelection(sel.el);
		onValue(sel.el.value);
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
		el.setRangeText(text, pos, pos, "end");
		log("insertBlock", { block, pos, needsNewline });
		captureSelection(el);
		onValue(el.value);
	};

	const wrap = (opts: WrapOptions) => {
		const sel = getSelection();
		if (!sel) return;

		const replacement = `${opts.prefix}${sel.text}${opts.suffix}`;
		sel.el.setRangeText(replacement, sel.start, sel.end, "end");
		log("wrap", { replacement, start: sel.start, end: sel.end });

		// Place cursor between prefix/suffix when wrapping empty selection
		const caret =
			sel.text.length === 0
				? sel.start + opts.prefix.length
				: sel.start + replacement.length;
		sel.el.setSelectionRange(caret, caret);

		captureSelection(sel.el);
		onValue(sel.el.value);
	};

	// ──────────────────────────────────────────────────────────────────────────

	return {
		setTextareaRef,
		handlers,
		mutators: { insert, insertBlock, wrap },
	};
}

type State = {
	value: string;
	selectionStart: number;
	selectionEnd: number;
};

export function createUndoStack(maxSize = 100) {
	const stack: State[] = [];
	let index = -1;

	const save = (el: HTMLTextAreaElement) => {
		const state: State = {
			value: el.value,
			selectionStart: el.selectionStart ?? 0,
			selectionEnd: el.selectionEnd ?? 0,
		};

		// Don't save if identical to current state
		const current = stack[index];
		if (current && current.value === state.value) return;

		// Remove any future states (we're branching history)
		stack.splice(index + 1);

		stack.push(state);
		index++;

		// Limit stack size
		if (stack.length > maxSize) {
			stack.shift();
			index--;
		}
	};

	const restore = (el: HTMLTextAreaElement, state: State) => {
		el.value = state.value;
		el.setSelectionRange(state.selectionStart, state.selectionEnd);
		el.dispatchEvent(new InputEvent("input", { bubbles: true }));
	};

	const undo = (el: HTMLTextAreaElement): boolean => {
		if (index <= 0) return false;

		index--;
		const state = stack[index];
		if (state) restore(el, state);
		return true;
	};

	const redo = (el: HTMLTextAreaElement): boolean => {
		if (index >= stack.length - 1) return false;

		index++;
		const state = stack[index];
		if (state) restore(el, state);
		return true;
	};

	return { save, undo, redo };
}

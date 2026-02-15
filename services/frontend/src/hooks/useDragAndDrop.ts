import { createSignal } from "solid-js";

const MIME_TYPE = "application/x-dnd";

type DragData = {
	itemId: string;
	containerId: string;
};

type DragAndDropOptions = {
	/** Called when an item is dropped into a different container */
	onDrop: (
		itemId: string,
		fromContainerId: string,
		toContainerId: string,
	) => void;
};

/**
 * Reusable drag-and-drop hook using the native HTML5 Drag and Drop API.
 *
 * Returns helpers to make any element draggable or a drop zone.
 * Tracks drag state reactively so consumers can style accordingly.
 *
 * @example
 * ```tsx
 * const dnd = createDragAndDrop({
 *   onDrop: (itemId, from, to) => moveItem(itemId, from, to),
 * });
 *
 * <div {...dnd.draggable(item.id, column.id)}>Drag me</div>
 * <div {...dnd.droppable(column.id)}>Drop here</div>
 *
 * dnd.isDragging(item.id)   // true while this item is mid-drag
 * dnd.isOver(column.id)     // true while dragging over this zone
 * ```
 */
export function createDragAndDrop(options: DragAndDropOptions) {
	const [draggedItem, setDraggedItem] = createSignal<DragData | null>(null);
	const [overContainerId, setOverContainerId] = createSignal<string | null>(
		null,
	);
	let didDrag = false;

	// --- Draggable props ---

	function draggable(itemId: string, containerId: string) {
		return {
			draggable: true,
			onDragStart: (e: DragEvent) => {
				didDrag = true;
				const data: DragData = { itemId, containerId };
				setDraggedItem(data);
				if (e.dataTransfer) {
					e.dataTransfer.effectAllowed = "move";
					e.dataTransfer.setData(MIME_TYPE, JSON.stringify(data));
				}
			},
			onDragEnd: () => {
				setDraggedItem(null);
				setOverContainerId(null);
				setTimeout(() => {
					didDrag = false;
				}, 0);
			},
		};
	}

	// --- Droppable props ---

	function droppable(containerId: string) {
		return {
			onDragOver: (e: DragEvent) => {
				e.preventDefault();
				if (e.dataTransfer) {
					e.dataTransfer.dropEffect = "move";
				}
				setOverContainerId(containerId);
			},
			onDragLeave: () => {
				setOverContainerId(null);
			},
			onDrop: (e: DragEvent) => {
				e.preventDefault();
				let data: DragData | null = null;

				// Prefer dataTransfer (works across frames), fall back to signal
				const raw = e.dataTransfer?.getData(MIME_TYPE);
				if (raw) {
					try {
						data = JSON.parse(raw) as DragData;
					} catch {
						// ignore parse errors
					}
				}
				if (!data) {
					data = draggedItem();
				}

				if (data && data.containerId !== containerId) {
					options.onDrop(data.itemId, data.containerId, containerId);
				}

				setDraggedItem(null);
				setOverContainerId(null);
			},
		};
	}

	// --- State queries ---

	/** True if the given item is currently being dragged */
	function isDragging(itemId: string): boolean {
		return draggedItem()?.itemId === itemId;
	}

	/** True if something is being dragged over the given container */
	function isOver(containerId: string): boolean {
		return overContainerId() === containerId;
	}

	/** True if any drag is in progress */
	function isActive(): boolean {
		return draggedItem() !== null;
	}

	/**
	 * Returns true if this was a drag interaction (not a click).
	 * Useful to guard click handlers on draggable elements.
	 *
	 * @example
	 * ```tsx
	 * onClick={() => { if (!dnd.wasDragged()) handleClick(); }}
	 * ```
	 */
	function wasDragged(): boolean {
		return didDrag;
	}

	return {
		draggable,
		droppable,
		isDragging,
		isOver,
		isActive,
		wasDragged,
	};
}

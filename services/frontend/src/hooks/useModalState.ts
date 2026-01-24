import { createSignal } from "solid-js";

export interface UseModalStateReturn<T> {
	isOpen: () => boolean;
	data: () => T | null;
	open: (data?: T) => void;
	close: () => void;
}

/**
 * Unified modal state management hook.
 *
 * @example
 * // Simple modal (no data)
 * const modal = useModalState();
 * modal.open();
 * <Dialog open={modal.isOpen()} onOpenChange={(open) => !open && modal.close()} />
 *
 * @example
 * // Modal with data (e.g., ID to delete)
 * const modal = useModalState<string>();
 * modal.open(tagId);
 * <Dialog open={modal.isOpen()}>Deleting {modal.data()}</Dialog>
 *
 * @example
 * // Modal with object data
 * const modal = useModalState<{ id: string; name: string }>();
 * modal.open({ id: tag.id, name: tag.name });
 */
export function useModalState<T = void>(): UseModalStateReturn<T> {
	const [isOpen, setIsOpen] = createSignal(false);
	const [data, setData] = createSignal<T | null>(null);

	const open = (newData?: T) => {
		setData(() => newData ?? null);
		setIsOpen(true);
	};

	const close = () => {
		setIsOpen(false);
		setData(null);
	};

	return {
		isOpen,
		data,
		open,
		close,
	};
}

import { useLocation } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";

export interface UseLinkedCommentReturn {
	linkedCommentId: () => string | null;
	scrollToComment: (commentId: string) => void;
	hasScrolled: () => boolean;
	dismiss: () => void;
}

export function useLinkedComment(): UseLinkedCommentReturn {
	const location = useLocation();
	const [linkedCommentId, setLinkedCommentId] = createSignal<string | null>(
		null,
	);
	const [hasScrolled, setHasScrolled] = createSignal(false);

	// React to router location hash changes (works with SPA navigation)
	createEffect(() => {
		const hash = location.hash;
		if (hash.startsWith("#comment-")) {
			const newId = hash.slice(9);
			if (newId !== linkedCommentId()) {
				setLinkedCommentId(newId);
				setHasScrolled(false);
			}
		} else if (linkedCommentId()) {
			// Hash was cleared or changed to something else
			setLinkedCommentId(null);
		}
	});

	const scrollToComment = (commentId: string) => {
		if (hasScrolled()) return;

		const element = document.getElementById(`comment-${commentId}`);
		if (element) {
			setTimeout(() => {
				element.scrollIntoView({ behavior: "smooth", block: "center" });
				setHasScrolled(true);
			}, 100);
		}
	};

	const dismiss = () => {
		setLinkedCommentId(null);
		setHasScrolled(false);
		// Clear hash from URL without triggering navigation
		history.replaceState(
			null,
			"",
			window.location.pathname + window.location.search,
		);
	};

	return {
		linkedCommentId,
		scrollToComment,
		hasScrolled,
		dismiss,
	};
}

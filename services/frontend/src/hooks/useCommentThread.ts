import { mutators, queries, useQuery, useZero } from "@package/database/client";
import { createSignal } from "solid-js";

export type EntityType = "package" | "ecosystem" | "project";

export interface UseCommentThreadOptions {
	entityType: EntityType;
	entityId: string;
}

interface Author {
	id: string;
	name: string | null;
}

export interface BaseComment {
	id: string;
	content: string;
	createdAt: number;
	updatedAt: number;
	deletedAt: number | null;
	replyToId: string | null;
	rootCommentId: string | null;
	author: Author | undefined;
}

export interface Reply extends BaseComment {
	replyTo?: { author?: Author };
}

export interface RootComment extends BaseComment {
	hasReplies: boolean;
}

const REPLIES_PAGE_SIZE = 20;

export function useCommentThread(options: () => UseCommentThreadOptions) {
	const zero = useZero();

	const isLoggedIn = () => zero().userID !== "anon";

	// Track loaded replies per root comment and their limits
	const [replyLimits, setReplyLimits] = createSignal<Map<string, number>>(
		new Map(),
	);

	// Get current user's account info
	const [account] = useQuery(() =>
		isLoggedIn() ? queries.account.myAccount({}) : null,
	);

	// Get thread for entity - separate queries to satisfy TypeScript
	const [packageThread, packageThreadResult] = useQuery(() => {
		const { entityType, entityId } = options();
		return entityType === "package"
			? queries.threads.byPackageId({ packageId: entityId })
			: null;
	});

	const [ecosystemThread, ecosystemThreadResult] = useQuery(() => {
		const { entityType, entityId } = options();
		return entityType === "ecosystem"
			? queries.threads.byEcosystemId({ ecosystemId: entityId })
			: null;
	});

	const [projectThread, projectThreadResult] = useQuery(() => {
		const { entityType, entityId } = options();
		return entityType === "project"
			? queries.threads.byProjectId({ projectId: entityId })
			: null;
	});

	// Combine thread results
	const thread = () => packageThread() ?? ecosystemThread() ?? projectThread();
	const threadResult = () => {
		const { entityType } = options();
		if (entityType === "package") return packageThreadResult();
		if (entityType === "ecosystem") return ecosystemThreadResult();
		return projectThreadResult();
	};

	// Get root comments (with hasReplies check via replies relation limited to 1)
	const [rootCommentsRaw] = useQuery(() => {
		const threadId = thread()?.id;
		return threadId ? queries.comments.rootsByThreadId({ threadId }) : null;
	});

	// Transform to add hasReplies flag
	const comments = (): readonly RootComment[] => {
		const raw = rootCommentsRaw() ?? [];
		return raw.map((c) => ({
			...c,
			hasReplies: (c.replies?.length ?? 0) > 0,
		})) as readonly RootComment[];
	};

	// Loading is complete when the thread query finishes
	const isLoading = () => threadResult().type !== "complete";

	const onSubmit = (
		content: string,
		replyToId?: string,
		rootCommentId?: string,
	) => {
		const { entityType, entityId } = options();
		zero().mutate(
			mutators.comments.create({
				entityType,
				entityId,
				content,
				replyToId,
				rootCommentId,
			}),
		);
		// Auto-expand replies for this root when submitting a reply
		if (rootCommentId) {
			showReplies(rootCommentId);
		}
	};

	const onEdit = (commentId: string, content: string) => {
		zero().mutate(mutators.comments.update({ id: commentId, content }));
	};

	const onDelete = (commentId: string) => {
		zero().mutate(mutators.comments.remove({ id: commentId }));
	};

	// Show replies for a root comment (initial load)
	const showReplies = (rootCommentId: string) => {
		setReplyLimits((prev) => {
			const next = new Map(prev);
			if (!next.has(rootCommentId)) {
				next.set(rootCommentId, REPLIES_PAGE_SIZE + 1); // +1 to detect "has more"
			}
			return next;
		});
	};

	// Load more replies
	const loadMoreReplies = (rootCommentId: string) => {
		setReplyLimits((prev) => {
			const next = new Map(prev);
			const current = next.get(rootCommentId) ?? REPLIES_PAGE_SIZE + 1;
			next.set(rootCommentId, current + REPLIES_PAGE_SIZE);
			return next;
		});
	};

	// Collapse replies
	const hideReplies = (rootCommentId: string) => {
		setReplyLimits((prev) => {
			const next = new Map(prev);
			next.delete(rootCommentId);
			return next;
		});
	};

	// Check if replies are shown for a root
	const isShowingReplies = (rootCommentId: string) =>
		replyLimits().has(rootCommentId);

	// Get current limit for a root (0 if not showing)
	const getReplyLimit = (rootCommentId: string) =>
		replyLimits().get(rootCommentId) ?? 0;

	return {
		comments,
		isLoading,
		currentUserId: () => (isLoggedIn() ? zero().userID : undefined),
		currentUserName: () => account()?.[0]?.name ?? undefined,
		onSubmit,
		onEdit,
		onDelete,
		showReplies,
		loadMoreReplies,
		hideReplies,
		isShowingReplies,
		getReplyLimit,
	};
}

// Hook to get replies for a specific root comment with pagination
export function useReplies(
	rootCommentId: () => string | undefined,
	limit: () => number,
) {
	const [repliesRaw] = useQuery(() => {
		const id = rootCommentId();
		const lim = limit();
		return id && lim > 0
			? queries.comments.repliesByRootId({ rootCommentId: id, limit: lim })
			: null;
	});

	const replies = (): readonly Reply[] =>
		(repliesRaw() ?? []) as readonly Reply[];

	// Has more if we got exactly the limit (which includes +1 for detection)
	const hasMore = () => {
		const lim = limit();
		const count = replies().length;
		return count >= lim;
	};

	// Actual replies to show (excluding the +1 detection item)
	const visibleReplies = (): readonly Reply[] => {
		const lim = limit();
		const all = replies();
		if (all.length >= lim) {
			return all.slice(0, lim - 1);
		}
		return all;
	};

	return {
		replies: visibleReplies,
		hasMore,
	};
}

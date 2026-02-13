import { mutators, queries, useQuery, useZero } from "@package/database/client";
import { createSignal } from "solid-js";
import { MAX_REPLIES_PER_THREAD } from "@/lib/constants";

export type EntityType =
	| "package"
	| "ecosystem"
	| "project"
	| "projectPackage"
	| "projectEcosystem";

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

export function useCommentThread(options: () => UseCommentThreadOptions) {
	const zero = useZero();

	const isLoggedIn = () => zero().userID !== "anon";

	// Track which root comments have their replies expanded
	const [showingRepliesSet, setShowingRepliesSet] = createSignal<Set<string>>(
		new Set(),
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

	const [projectPackageThread, projectPackageThreadResult] = useQuery(() => {
		const { entityType, entityId } = options();
		return entityType === "projectPackage"
			? queries.threads.byProjectPackageId({ projectPackageId: entityId })
			: null;
	});

	const [projectEcosystemThread, projectEcosystemThreadResult] = useQuery(
		() => {
			const { entityType, entityId } = options();
			return entityType === "projectEcosystem"
				? queries.threads.byProjectEcosystemId({
						projectEcosystemId: entityId,
					})
				: null;
		},
	);

	// Combine thread results
	const thread = () =>
		packageThread() ??
		ecosystemThread() ??
		projectThread() ??
		projectPackageThread() ??
		projectEcosystemThread();
	const threadResult = () => {
		const { entityType } = options();
		if (entityType === "package") return packageThreadResult();
		if (entityType === "ecosystem") return ecosystemThreadResult();
		if (entityType === "projectPackage") return projectPackageThreadResult();
		if (entityType === "projectEcosystem")
			return projectEcosystemThreadResult();
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

	// Show replies for a root comment
	const showReplies = (rootCommentId: string) => {
		setShowingRepliesSet((prev) => new Set(prev).add(rootCommentId));
	};

	// Collapse replies
	const hideReplies = (rootCommentId: string) => {
		setShowingRepliesSet((prev) => {
			const next = new Set(prev);
			next.delete(rootCommentId);
			return next;
		});
	};

	// Check if replies are shown for a root
	const isShowingReplies = (rootCommentId: string) =>
		showingRepliesSet().has(rootCommentId);

	return {
		comments,
		threadId: () => thread()?.id,
		isLoading,
		currentUserId: () => (isLoggedIn() ? zero().userID : undefined),
		currentUserName: () => account()?.[0]?.name ?? undefined,
		onSubmit,
		onEdit,
		onDelete,
		showReplies,
		hideReplies,
		isShowingReplies,
	};
}

// Hook to get replies for a specific root comment
export function useReplies(rootCommentId: () => string | undefined) {
	const [repliesRaw] = useQuery(() => {
		const id = rootCommentId();
		return id
			? queries.comments.repliesByRootId({
					rootCommentId: id,
					limit: MAX_REPLIES_PER_THREAD,
				})
			: null;
	});

	const replies = (): readonly Reply[] =>
		(repliesRaw() ?? []) as readonly Reply[];

	return { replies };
}

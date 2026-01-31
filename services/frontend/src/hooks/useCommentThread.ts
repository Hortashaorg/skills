import { mutators, queries, useQuery, useZero } from "@package/database/client";

export type EntityType = "package" | "ecosystem" | "project";

export interface UseCommentThreadOptions {
	entityType: EntityType;
	entityId: string;
}

export function useCommentThread(options: () => UseCommentThreadOptions) {
	const zero = useZero();

	const isLoggedIn = () => zero().userID !== "anon";

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

	// Get comments if thread exists
	const [comments, commentsResult] = useQuery(() => {
		const threadId = thread()?.id;
		return threadId ? queries.comments.byThreadId({ threadId }) : null;
	});

	const isLoading = () =>
		threadResult().type !== "complete" ||
		(thread()?.id !== undefined && commentsResult().type !== "complete");

	const onSubmit = (content: string, replyToId?: string) => {
		const { entityType, entityId } = options();
		zero().mutate(
			mutators.comments.create({
				entityType,
				entityId,
				content,
				replyToId,
			}),
		);
	};

	const onEdit = (commentId: string, content: string) => {
		zero().mutate(mutators.comments.update({ id: commentId, content }));
	};

	const onDelete = (commentId: string) => {
		zero().mutate(mutators.comments.remove({ id: commentId }));
	};

	return {
		comments: () => comments() ?? [],
		isLoading,
		currentUserId: () => (isLoggedIn() ? zero().userID : undefined),
		currentUserName: () => account()?.[0]?.name ?? undefined,
		onSubmit,
		onEdit,
		onDelete,
	};
}

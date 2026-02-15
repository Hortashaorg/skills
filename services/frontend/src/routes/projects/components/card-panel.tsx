import { queries, useQuery } from "@package/database/client";
import { createMemo, createSignal, For, Show } from "solid-js";
import { CommentThread } from "@/components/composite/comment-thread";
import type { EntitySearch } from "@/components/composite/markdown-editor";
import { Stack } from "@/components/primitives/stack";
import { Text } from "@/components/primitives/text";
import { Badge } from "@/components/ui/badge";
import { extractEntityIdsFromMultiple } from "@/components/ui/markdown-output";
import { Select, type SelectOption } from "@/components/ui/select";
import { SidePanel } from "@/components/ui/side-panel";
import { Spinner } from "@/components/ui/spinner";
import { useEcosystemByIds } from "@/hooks/ecosystems/useEcosystemByIds";
import { useEcosystemSearch } from "@/hooks/ecosystems/useEcosystemSearch";
import { usePackageByIds } from "@/hooks/packages/usePackageByIds";
import { usePackageSearch } from "@/hooks/packages/usePackageSearch";
import { useProjectByIds } from "@/hooks/projects/useProjectByIds";
import { useProjectSearch } from "@/hooks/projects/useProjectSearch";
import { useCommentThread, useReplies } from "@/hooks/useCommentThread";
import { useUserByIds } from "@/hooks/users/useUserByIds";
import { useUserSearch } from "@/hooks/users/useUserSearch";
import { MAX_REPLIES_PER_THREAD } from "@/lib/constants";
import { buildPackageUrl } from "@/lib/url";
import type { KanbanCard, KanbanColumn } from "../types";

type CardPanelProps = {
	card: KanbanCard;
	currentColumnId: string;
	columns: KanbanColumn[];
	readonly?: boolean;
	onStatusChange: (
		cardId: string,
		fromColumnId: string,
		toColumnId: string,
	) => void;
	onClose: () => void;
	ref?: (el: HTMLElement) => void;
};

export const CardPanel = (props: CardPanelProps) => {
	const statusOptions = (): SelectOption<string>[] =>
		props.columns.map((col) => ({
			value: col.id,
			label: col.label,
		}));

	const handleStatusChange = (newColumnId: string) => {
		if (newColumnId !== props.currentColumnId) {
			props.onStatusChange(props.card.id, props.currentColumnId, newColumnId);
		}
	};

	// Comment thread
	const thread = useCommentThread(() => ({
		entityType:
			props.card.kind === "package" ? "projectPackage" : "projectEcosystem",
		entityId: props.card.id,
	}));

	// Entity search hooks for markdown editor
	const packageSearch = usePackageSearch({ showRecentWhenEmpty: false });
	const ecosystemSearch = useEcosystemSearch({ showRecentWhenEmpty: false });
	const projectSearch = useProjectSearch({ showRecentWhenEmpty: false });
	const userSearch = useUserSearch({
		showRecentWhenEmpty: false,
		sortBy: "createdAt",
	});

	const entitySearch: EntitySearch = {
		packages: packageSearch,
		ecosystems: ecosystemSearch,
		projects: projectSearch,
		users: userSearch,
	};

	// Entity extraction for markdown token resolution
	const [editorContent, setEditorContent] = createSignal("");

	const [allThreadComments] = useQuery(() => {
		const threadId = thread.threadId();
		return threadId ? queries.comments.allByThreadId({ threadId }) : null;
	});

	const extractedIds = createMemo(() => {
		const comments = allThreadComments() ?? [];
		const contents = comments.map((c) => c.content);
		const editor = editorContent();
		if (editor) {
			contents.push(editor);
		}
		return extractEntityIdsFromMultiple(contents);
	});

	const { packages: packagesByIds } = usePackageByIds(
		() => extractedIds().packages,
	);
	const { ecosystems: ecosystemsByIds } = useEcosystemByIds(
		() => extractedIds().ecosystems,
	);
	const { projects: projectsByIds } = useProjectByIds(
		() => extractedIds().projects,
	);
	const { users: usersByIds } = useUserByIds(() => extractedIds().users);

	const entityByIds = {
		packages: packagesByIds,
		ecosystems: ecosystemsByIds,
		projects: projectsByIds,
		users: usersByIds,
	};

	const getRepliesData = (rootCommentId: string) => {
		const { replies } = useReplies(() =>
			thread.isShowingReplies(rootCommentId) ? rootCommentId : undefined,
		);
		const replyList = replies();
		return {
			replies: replyList,
			isAtMax: replyList.length >= MAX_REPLIES_PER_THREAD,
		};
	};

	return (
		<SidePanel
			open={true}
			onClose={props.onClose}
			title={props.card.name}
			titleHref={
				props.card.kind === "package"
					? buildPackageUrl(props.card.registry ?? "", props.card.name)
					: `/ecosystem/${encodeURIComponent(props.card.slug ?? props.card.name)}`
			}
			ref={props.ref}
		>
			<Stack spacing="lg">
				{/* Type */}
				<div>
					<Text size="sm" weight="semibold" class="mb-2">
						Type
					</Text>
					<Badge
						variant={props.card.kind === "package" ? "primary" : "secondary"}
						size="sm"
					>
						{props.card.kind === "package" ? "Package" : "Ecosystem"}
					</Badge>
				</div>

				{/* Status */}
				<div>
					<Text size="sm" weight="semibold" class="mb-2">
						Status
					</Text>
					<Select
						options={statusOptions()}
						value={props.currentColumnId}
						onChange={handleStatusChange}
						disabled={props.readonly}
						aria-label="Card status"
						size="sm"
					/>
				</div>

				{/* Description */}
				<Show when={props.card.description}>
					<div>
						<Text size="sm" weight="semibold" class="mb-2">
							Description
						</Text>
						<Text size="sm" color="muted">
							{props.card.description}
						</Text>
					</div>
				</Show>

				{/* Tags */}
				<Show when={props.card.tags.length > 0}>
					<div>
						<Text size="sm" weight="semibold" class="mb-2">
							Tags
						</Text>
						<div class="flex flex-wrap gap-1">
							<For each={props.card.tags}>
								{(tag) => (
									<Badge variant="subtle" size="sm">
										{tag}
									</Badge>
								)}
							</For>
						</div>
					</div>
				</Show>

				{/* Discussion */}
				<div class="border-t border-outline dark:border-outline-dark pt-4">
					<Text size="sm" weight="semibold" class="mb-3">
						Discussion
					</Text>
					<Show
						when={!thread.isLoading()}
						fallback={
							<div class="flex justify-center py-4">
								<Spinner size="sm" />
							</div>
						}
					>
						<CommentThread
							compact
							comments={thread.comments()}
							currentUserId={
								props.readonly ? undefined : thread.currentUserId()
							}
							currentUserName={
								props.readonly ? undefined : thread.currentUserName()
							}
							onCommentSubmit={thread.onSubmit}
							onCommentEdit={thread.onEdit}
							onCommentDelete={thread.onDelete}
							showReplies={thread.showReplies}
							hideReplies={thread.hideReplies}
							isShowingReplies={thread.isShowingReplies}
							getRepliesData={getRepliesData}
							onEditorContentChange={setEditorContent}
							search={entitySearch}
							byIds={entityByIds}
						/>
					</Show>
				</div>
			</Stack>
		</SidePanel>
	);
};

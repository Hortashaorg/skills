import type { ProjectStatus } from "@package/database/client";

export type KanbanCard = {
	id: string;
	entityId: string;
	name: string;
	description?: string;
	tags: string[];
	kind: "package" | "ecosystem";
	registry?: string;
	slug?: string;
	upvoteCount: number;
	isUpvoted: boolean;
	hasComments: boolean;
};

export type KanbanColumn = {
	id: ProjectStatus;
	statusRecordId?: string;
	label: string;
	cards: KanbanCard[];
};

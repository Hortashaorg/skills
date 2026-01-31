export type Comment = {
	id: string;
	author: string;
	avatar: string;
	timestamp: string;
	content: string;
	replyToAuthor?: string;
	editedAt?: string;
	replies?: Comment[];
};

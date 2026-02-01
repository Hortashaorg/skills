import { z } from "@package/common";
import { defineQuery } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";

export const rootsByThreadId = defineQuery(
	z.object({
		threadId: z.string(),
		limit: z.number().default(20),
	}),
	({ args }) => {
		return zql.comments
			.where("threadId", args.threadId)
			.where("rootCommentId", "IS", null)
			.orderBy("createdAt", "desc")
			.limit(args.limit)
			.related("author")
			.related("replies", (r) => r.limit(1));
	},
);

export const repliesByRootId = defineQuery(
	z.object({
		rootCommentId: z.string(),
		limit: z.number().default(20),
	}),
	({ args }) => {
		return zql.comments
			.where("rootCommentId", args.rootCommentId)
			.orderBy("createdAt", "asc")
			.limit(args.limit)
			.related("author")
			.related("replyTo", (r) => r.related("author"));
	},
);

export const byId = defineQuery(z.object({ id: z.string() }), ({ args }) => {
	return zql.comments
		.where("id", args.id)
		.related("author")
		.related("replies", (r) => r.related("author"))
		.related("thread")
		.one();
});

export const byAuthorId = defineQuery(
	z.object({
		authorId: z.string(),
		limit: z.number().default(50),
	}),
	({ args }) => {
		return zql.comments
			.where("authorId", args.authorId)
			.orderBy("createdAt", "desc")
			.limit(args.limit)
			.related("thread");
	},
);

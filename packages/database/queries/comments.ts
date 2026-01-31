import { z } from "@package/common";
import { defineQuery } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";

export const byThreadId = defineQuery(
	z.object({
		threadId: z.string(),
		limit: z.number().default(100),
	}),
	({ args }) => {
		return zql.comments
			.where("threadId", args.threadId)
			.where("replyToId", "IS", null)
			.orderBy("createdAt", "desc") // Newest top-level comments first
			.limit(args.limit)
			.related("author")
			.related(
				"replies",
				(r) => r.related("author").orderBy("createdAt", "asc"), // Replies chronologically
			);
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

import { MAX_COMMENT_LENGTH, z } from "@package/common";
import { defineMutator } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";
import { newRecord, now } from "./helpers.ts";

const entityTypeSchema = z.enum(["package", "ecosystem", "project"]);

export const create = defineMutator(
	z
		.object({
			entityType: entityTypeSchema,
			entityId: z.string(),
			content: z.string().min(1).max(MAX_COMMENT_LENGTH),
			replyToId: z.string().optional(),
			rootCommentId: z.string().optional(),
		})
		.refine(
			(data) => {
				// If replying, rootCommentId is required
				if (data.replyToId && !data.rootCommentId) return false;
				// If not replying, rootCommentId must not be set
				if (!data.replyToId && data.rootCommentId) return false;
				return true;
			},
			{
				message:
					"rootCommentId is required when replying and must not be set for root comments",
			},
		),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to comment");
		}

		// Find or create thread for this entity
		let threadId: string | null = null;

		if (args.entityType === "package") {
			const thread = await tx.run(
				zql.threads.one().where("packageId", args.entityId),
			);
			if (thread) {
				threadId = thread.id;
			} else {
				const entity = await tx.run(
					zql.packages.one().where("id", args.entityId),
				);
				if (!entity) throw new Error("Package not found");
			}
		} else if (args.entityType === "ecosystem") {
			const thread = await tx.run(
				zql.threads.one().where("ecosystemId", args.entityId),
			);
			if (thread) {
				threadId = thread.id;
			} else {
				const entity = await tx.run(
					zql.ecosystems.one().where("id", args.entityId),
				);
				if (!entity) throw new Error("Ecosystem not found");
			}
		} else if (args.entityType === "project") {
			const thread = await tx.run(
				zql.threads.one().where("projectId", args.entityId),
			);
			if (thread) {
				threadId = thread.id;
			} else {
				const entity = await tx.run(
					zql.projects.one().where("id", args.entityId),
				);
				if (!entity) throw new Error("Project not found");
			}
		}

		// Create thread if it doesn't exist
		if (!threadId) {
			const threadRecord = newRecord();
			await tx.mutate.threads.insert({
				id: threadRecord.id,
				packageId: args.entityType === "package" ? args.entityId : null,
				ecosystemId: args.entityType === "ecosystem" ? args.entityId : null,
				projectId: args.entityType === "project" ? args.entityId : null,
				createdAt: threadRecord.now,
			});
			threadId = threadRecord.id;
		}

		// Verify parent comment exists and belongs to same thread
		if (args.replyToId) {
			const parentComment = await tx.run(
				zql.comments.one().where("id", args.replyToId),
			);
			if (!parentComment) {
				throw new Error("Parent comment not found");
			}
			if (parentComment.threadId !== threadId) {
				throw new Error("Parent comment belongs to different thread");
			}

			// Verify rootCommentId matches what we'd compute from the parent
			const expectedRootId = parentComment.rootCommentId ?? parentComment.id;
			if (args.rootCommentId !== expectedRootId) {
				throw new Error("rootCommentId does not match parent's root");
			}
		}

		// Verify root comment exists and belongs to same thread
		if (args.rootCommentId) {
			const rootComment = await tx.run(
				zql.comments.one().where("id", args.rootCommentId),
			);
			if (!rootComment) {
				throw new Error("Root comment not found");
			}
			if (rootComment.threadId !== threadId) {
				throw new Error("Root comment belongs to different thread");
			}
			if (rootComment.rootCommentId !== null) {
				throw new Error("Root comment cannot itself be a reply");
			}
		}

		const record = newRecord();

		await tx.mutate.comments.insert({
			id: record.id,
			threadId: threadId,
			authorId: ctx.userID,
			content: args.content,
			replyToId: args.replyToId ?? null,
			rootCommentId: args.rootCommentId ?? null,
			createdAt: record.now,
			updatedAt: record.now,
		});
	},
);

export const update = defineMutator(
	z.object({
		id: z.string(),
		content: z.string().min(1).max(MAX_COMMENT_LENGTH),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to edit comment");
		}

		const comment = await tx.run(zql.comments.one().where("id", args.id));
		if (!comment) {
			throw new Error("Comment not found");
		}
		if (comment.authorId !== ctx.userID) {
			throw new Error("Not authorized to edit this comment");
		}

		await tx.mutate.comments.update({
			id: args.id,
			content: args.content,
			updatedAt: now(),
		});
	},
);

export const remove = defineMutator(
	z.object({
		id: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to delete comment");
		}

		const comment = await tx.run(zql.comments.one().where("id", args.id));
		if (!comment) {
			throw new Error("Comment not found");
		}
		if (comment.authorId !== ctx.userID) {
			throw new Error("Not authorized to delete this comment");
		}

		// Soft delete - clear content and mark as deleted
		// This preserves the record for FK integrity with replies
		await tx.mutate.comments.update({
			id: args.id,
			content: "",
			deletedAt: now(),
			updatedAt: now(),
		});
	},
);

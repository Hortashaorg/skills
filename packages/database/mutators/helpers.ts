import type { Transaction } from "@rocicorp/zero";
import type { projectStatusEnum } from "../db/schema/enums.ts";
import type { Schema } from "../zero-schema.gen.ts";
import { zql } from "../zero-schema.gen.ts";

/** Check that the caller is a project member, optionally requiring owner role */
export const requireProjectMember = async (
	tx: Transaction<Schema>,
	projectId: string,
	userId: string,
	requiredRole?: "owner",
) => {
	if (userId === "anon") {
		throw new Error("Must be logged in");
	}

	const members = await tx.run(
		zql.projectMembers.where("projectId", projectId),
	);

	const member = members.find((m) => m.accountId === userId);
	if (!member) {
		throw new Error("Not a member of this project");
	}
	if (requiredRole === "owner" && member.role !== "owner") {
		throw new Error("Only project owners can perform this action");
	}

	return { member, members };
};

/** Delete all comments in a thread, then the thread itself. Deletes replies before root comments to respect FK constraints. */
export const deleteThreadWithComments = async (
	tx: Transaction<Schema>,
	threadId: string,
) => {
	const comments = await tx.run(zql.comments.where("threadId", threadId));
	// Delete replies first (have replyToId), then root comments
	const replies = comments.filter((c) => c.replyToId !== null);
	const roots = comments.filter((c) => c.replyToId === null);
	for (const comment of replies) {
		await tx.mutate.comments.delete({ id: comment.id });
	}
	for (const comment of roots) {
		await tx.mutate.comments.delete({ id: comment.id });
	}
	await tx.mutate.threads.delete({ id: threadId });
};

type ProjectStatus = (typeof projectStatusEnum.enumValues)[number];

/** Resolve the default status for new cards in a project. Uses project.defaultStatus if set and still active, otherwise falls back to the first active status by position. */
export const resolveDefaultStatus = async (
	tx: Transaction<Schema>,
	projectId: string,
): Promise<ProjectStatus> => {
	const projects = await tx.run(zql.projects.where("id", projectId));
	const project = projects[0];
	if (project?.defaultStatus) {
		const active = await tx.run(
			zql.projectStatuses
				.where("projectId", projectId)
				.where("status", project.defaultStatus),
		);
		if (active.length > 0) return project.defaultStatus;
	}
	const statuses = await tx.run(
		zql.projectStatuses
			.where("projectId", projectId)
			.orderBy("position", "asc"),
	);
	return statuses[0]?.status ?? "evaluating";
};

/** Generate a new UUID and timestamp for record creation */
export const newRecord = () => ({
	id: crypto.randomUUID(),
	now: Date.now(),
});

/** Get current timestamp for updates */
export const now = () => Date.now();

import { z } from "@package/common";
import { defineMutator } from "@rocicorp/zero";
import { zql } from "../zero-schema.gen.ts";
import { newRecord, now } from "./helpers.ts";

export const add = defineMutator(
	z.object({
		projectId: z.string(),
		accountId: z.string(),
		role: z.enum(["contributor"]).default("contributor"),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to add project member");
		}

		const members = await tx.run(
			zql.projectMembers.where("projectId", args.projectId),
		);

		const callerMember = members.find((m) => m.accountId === ctx.userID);
		if (!callerMember || callerMember.role !== "owner") {
			throw new Error("Not authorized: must be project owner");
		}

		const alreadyMember = members.find((m) => m.accountId === args.accountId);
		if (alreadyMember) {
			throw new Error("User is already a member of this project");
		}

		const record = newRecord();

		await tx.mutate.projectMembers.insert({
			id: record.id,
			projectId: args.projectId,
			accountId: args.accountId,
			role: args.role,
			createdAt: record.now,
			updatedAt: record.now,
		});

		await tx.mutate.projects.update({
			id: args.projectId,
			updatedAt: now(),
		});
	},
);

export const remove = defineMutator(
	z.object({
		id: z.string(),
		projectId: z.string(),
	}),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in to remove project member");
		}

		const members = await tx.run(
			zql.projectMembers.where("projectId", args.projectId),
		);

		const callerMember = members.find((m) => m.accountId === ctx.userID);
		if (!callerMember || callerMember.role !== "owner") {
			throw new Error("Not authorized: must be project owner");
		}

		const targetMember = members.find((m) => m.id === args.id);
		if (!targetMember) {
			throw new Error("Member not found");
		}

		if (targetMember.role === "owner") {
			const ownerCount = members.filter((m) => m.role === "owner").length;
			if (ownerCount <= 1) {
				throw new Error("Cannot remove the last owner of a project");
			}
		}

		await tx.mutate.projectMembers.delete({ id: args.id });

		await tx.mutate.projects.update({
			id: args.projectId,
			updatedAt: now(),
		});
	},
);

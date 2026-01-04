import { defineMutator } from "@rocicorp/zero";
import { z } from "zod";
import { zql } from "../zero-schema.gen.ts";
import { now } from "./helpers.ts";

export const markRead = defineMutator(
	z.object({ id: z.string() }),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in");
		}

		const notification = await tx.run(
			zql.notifications.one().where("id", "=", args.id),
		);

		if (!notification) {
			throw new Error("Notification not found");
		}

		if (notification.accountId !== ctx.userID) {
			throw new Error("Not your notification");
		}

		await tx.mutate.notifications.update({
			id: args.id,
			read: true,
			updatedAt: now(),
		});
	},
);

export const markUnread = defineMutator(
	z.object({ id: z.string() }),
	async ({ tx, args, ctx }) => {
		if (ctx.userID === "anon") {
			throw new Error("Must be logged in");
		}

		const notification = await tx.run(
			zql.notifications.one().where("id", "=", args.id),
		);

		if (!notification) {
			throw new Error("Notification not found");
		}

		if (notification.accountId !== ctx.userID) {
			throw new Error("Not your notification");
		}

		await tx.mutate.notifications.update({
			id: args.id,
			read: false,
			updatedAt: now(),
		});
	},
);

export const markAllRead = defineMutator(async ({ tx, ctx }) => {
	if (ctx.userID === "anon") {
		throw new Error("Must be logged in");
	}

	const unread = await tx.run(
		zql.notifications.where("accountId", ctx.userID).where("read", false),
	);

	const timestamp = now();
	await Promise.all(
		unread.map((notification) =>
			tx.mutate.notifications.update({
				id: notification.id,
				read: true,
				updatedAt: timestamp,
			}),
		),
	);
});

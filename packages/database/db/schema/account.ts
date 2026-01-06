import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const account = pgTable("account", {
	id: uuid().primaryKey(),
	email: varchar({ length: 100 }).unique(),
	name: varchar({ length: 50 }).unique(),
	zitadelId: varchar({ length: 30 }).unique(),
	createdAt: timestamp().notNull(),
	updatedAt: timestamp().notNull(),
});

import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const account = pgTable("account", {
	id: uuid().primaryKey(),
	name: varchar({ length: 50 }).unique(),
	zitadelId: varchar({ length: 30 }).notNull().unique(),
	createdAt: timestamp().notNull(),
	updatedAt: timestamp().notNull(),
});

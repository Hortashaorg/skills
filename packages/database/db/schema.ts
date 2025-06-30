import { sql } from "drizzle-orm";
import { date, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

export const account = pgTable("account", {
	id: uuid().primaryKey().defaultRandom(),
	email: varchar({ length: 100 }).notNull().unique(),
	name: varchar({ length: 50 }).unique(),
	createdAt: date().notNull().default(sql`now()`),
	updatedAt: date().notNull().default(sql`now()`),
});

export const message = pgTable("message", {
	id: uuid().primaryKey().defaultRandom(),
	message: text().notNull(),
	createdAt: date().notNull().default(sql`now()`),
	updatedAt: date().notNull().default(sql`now()`),
});

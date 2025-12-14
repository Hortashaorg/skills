import { relations } from "drizzle-orm";
import {
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const account = pgTable("account", {
	id: uuid().primaryKey(),
	email: varchar({ length: 100 }).notNull().unique(),
	name: varchar({ length: 50 }).unique(),
	createdAt: timestamp().notNull(),
	updatedAt: timestamp().notNull(),
});

export const tech = pgTable("technology", {
	id: uuid().primaryKey(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	github: varchar({ length: 255 }),
	website: varchar({ length: 255 }),
	createdAt: timestamp().notNull(),
	updatedAt: timestamp().notNull(),
});

export const tag = pgTable("tag", {
	id: uuid().primaryKey(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	createdAt: timestamp().notNull(),
	updatedAt: timestamp().notNull(),
});

export const tagToTech = pgTable(
	"tag_to_technology",
	{
		techId: uuid()
			.notNull()
			.references(() => tech.id),
		tagId: uuid()
			.notNull()
			.references(() => tag.id),
	},
	(t) => [primaryKey({ columns: [t.techId, t.tagId] })],
);

export const techRelations = relations(tech, ({ many }) => ({
	tagsToTech: many(tagToTech),
}));

export const tagRelations = relations(tag, ({ many }) => ({
	tagsToTech: many(tagToTech),
}));

export const tagsToTechRelations = relations(tagToTech, ({ one }) => ({
	tech: one(tech, {
		fields: [tagToTech.techId],
		references: [tech.id],
	}),
	tag: one(tag, {
		fields: [tagToTech.tagId],
		references: [tag.id],
	}),
}));

import { index, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { account } from "./account.ts";
import { packages } from "./packages.ts";

export const projects = pgTable("projects", {
	id: uuid().primaryKey(),
	name: text().notNull(),
	description: text(),
	accountId: uuid()
		.notNull()
		.references(() => account.id),
	createdAt: timestamp().notNull(),
	updatedAt: timestamp().notNull(),
});

export const projectPackages = pgTable(
	"project_packages",
	{
		id: uuid().primaryKey(),
		projectId: uuid()
			.notNull()
			.references(() => projects.id),
		packageId: uuid()
			.notNull()
			.references(() => packages.id),
		createdAt: timestamp().notNull(),
	},
	(table) => [
		unique().on(table.projectId, table.packageId),
		index("idx_project_packages_project_id").on(table.projectId),
	],
);

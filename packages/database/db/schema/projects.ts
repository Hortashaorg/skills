import {
	index,
	integer,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";
import { account } from "./account.ts";
import { projectMemberRoleEnum, projectStatusEnum } from "./enums.ts";
import { packages } from "./packages.ts";

export const projects = pgTable("projects", {
	id: uuid().primaryKey(),
	name: text().notNull(),
	description: text(),
	accountId: uuid()
		.notNull()
		.references(() => account.id),
	defaultStatus: projectStatusEnum(),
	upvoteCount: integer().notNull(),
	createdAt: timestamp().notNull(),
	updatedAt: timestamp().notNull(),
});

export const projectUpvotes = pgTable(
	"project_upvotes",
	{
		id: uuid().primaryKey(),
		projectId: uuid()
			.notNull()
			.references(() => projects.id),
		accountId: uuid()
			.notNull()
			.references(() => account.id),
		createdAt: timestamp().notNull(),
	},
	(table) => [
		unique().on(table.projectId, table.accountId),
		index("idx_project_upvotes_project_id").on(table.projectId),
	],
);

export const projectStatuses = pgTable(
	"project_statuses",
	{
		id: uuid().primaryKey(),
		projectId: uuid()
			.notNull()
			.references(() => projects.id),
		status: projectStatusEnum().notNull(),
		position: integer().notNull(),
		createdAt: timestamp().notNull(),
		updatedAt: timestamp().notNull(),
	},
	(table) => [
		unique().on(table.projectId, table.status),
		index("idx_project_statuses_project_id").on(table.projectId),
	],
);

export const projectMembers = pgTable(
	"project_members",
	{
		id: uuid().primaryKey(),
		projectId: uuid()
			.notNull()
			.references(() => projects.id),
		accountId: uuid()
			.notNull()
			.references(() => account.id),
		role: projectMemberRoleEnum().notNull(),
		createdAt: timestamp().notNull(),
		updatedAt: timestamp().notNull(),
	},
	(table) => [
		unique().on(table.projectId, table.accountId),
		index("idx_project_members_project_id").on(table.projectId),
		index("idx_project_members_account_id").on(table.accountId),
	],
);

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
		status: projectStatusEnum().notNull(),
		createdAt: timestamp().notNull(),
		updatedAt: timestamp().notNull(),
	},
	(table) => [
		unique().on(table.projectId, table.packageId),
		index("idx_project_packages_project_id").on(table.projectId),
	],
);

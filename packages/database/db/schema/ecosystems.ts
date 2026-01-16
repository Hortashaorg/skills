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
import { packages } from "./packages.ts";
import { projects } from "./projects.ts";

export const ecosystems = pgTable(
	"ecosystems",
	{
		id: uuid().primaryKey(),
		name: text().notNull(),
		slug: text().notNull().unique(),
		description: text(),
		website: text(),
		upvoteCount: integer().notNull(),
		createdAt: timestamp().notNull(),
		updatedAt: timestamp().notNull(),
	},
	(table) => [index("idx_ecosystems_upvote_count").on(table.upvoteCount)],
);

export const ecosystemPackages = pgTable(
	"ecosystem_packages",
	{
		id: uuid().primaryKey(),
		ecosystemId: uuid()
			.notNull()
			.references(() => ecosystems.id),
		packageId: uuid()
			.notNull()
			.references(() => packages.id),
		createdAt: timestamp().notNull(),
	},
	(table) => [
		unique().on(table.ecosystemId, table.packageId),
		index("idx_ecosystem_packages_ecosystem_id").on(table.ecosystemId),
		index("idx_ecosystem_packages_package_id").on(table.packageId),
	],
);

export const ecosystemUpvotes = pgTable(
	"ecosystem_upvotes",
	{
		id: uuid().primaryKey(),
		ecosystemId: uuid()
			.notNull()
			.references(() => ecosystems.id),
		accountId: uuid()
			.notNull()
			.references(() => account.id),
		createdAt: timestamp().notNull(),
	},
	(table) => [
		unique().on(table.ecosystemId, table.accountId),
		index("idx_ecosystem_upvotes_account_id").on(table.accountId),
	],
);

export const projectEcosystems = pgTable(
	"project_ecosystems",
	{
		id: uuid().primaryKey(),
		projectId: uuid()
			.notNull()
			.references(() => projects.id),
		ecosystemId: uuid()
			.notNull()
			.references(() => ecosystems.id),
		createdAt: timestamp().notNull(),
	},
	(table) => [
		unique().on(table.projectId, table.ecosystemId),
		index("idx_project_ecosystems_project_id").on(table.projectId),
	],
);

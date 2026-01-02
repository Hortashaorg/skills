import { sql } from "drizzle-orm";
import {
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";
import { account } from "./account.ts";
import {
	dependencyTypeEnum,
	fetchStatusEnum,
	packageStatusEnum,
	registryEnum,
} from "./enums.ts";

export const packages = pgTable(
	"packages",
	{
		id: uuid().primaryKey(),
		name: text().notNull(),
		registry: registryEnum().notNull(),
		status: packageStatusEnum().notNull(),
		failureReason: text(),
		description: text(),
		homepage: text(),
		repository: text(),
		latestVersion: text(),
		distTags: jsonb().$type<Record<string, string>>(),
		upvoteCount: integer().notNull(),
		lastFetchAttempt: timestamp().notNull(),
		lastFetchSuccess: timestamp().notNull(),
		createdAt: timestamp().notNull(),
		updatedAt: timestamp().notNull(),
	},
	(table) => [
		unique().on(table.name, table.registry),
		index("idx_packages_upvote_count").on(table.upvoteCount),
	],
);

export const packageReleaseChannels = pgTable(
	"package_release_channels",
	{
		id: uuid().primaryKey(),
		packageId: uuid()
			.notNull()
			.references(() => packages.id),
		channel: text().notNull(),
		version: text().notNull(),
		publishedAt: timestamp().notNull(),
		createdAt: timestamp().notNull(),
		updatedAt: timestamp().notNull(),
	},
	(table) => [unique().on(table.packageId, table.channel)],
);

export const channelDependencies = pgTable(
	"channel_dependencies",
	{
		id: uuid().primaryKey(),
		channelId: uuid()
			.notNull()
			.references(() => packageReleaseChannels.id),
		dependencyPackageId: uuid()
			.notNull()
			.references(() => packages.id),
		dependencyVersionRange: text().notNull(),
		dependencyType: dependencyTypeEnum().notNull(),
		createdAt: timestamp().notNull(),
	},
	(table) => [
		index("idx_channel_dependencies_channel_id").on(table.channelId),
		unique().on(
			table.channelId,
			table.dependencyPackageId,
			table.dependencyType,
		),
	],
);

export const packageFetches = pgTable(
	"package_fetches",
	{
		id: uuid().primaryKey(),
		packageId: uuid()
			.notNull()
			.references(() => packages.id),
		status: fetchStatusEnum().notNull(),
		errorMessage: text(),
		createdAt: timestamp().notNull(),
		completedAt: timestamp(),
	},
	(table) => [
		index("idx_package_fetches_package_id").on(table.packageId),
		index("idx_package_fetches_pending")
			.on(table.status, table.createdAt)
			.where(sql`${table.status} = 'pending'`),
	],
);

export const tags = pgTable("tags", {
	id: uuid().primaryKey(),
	name: text().notNull().unique(),
	slug: text().notNull().unique(),
	description: text(),
	createdAt: timestamp().notNull(),
	updatedAt: timestamp().notNull(),
});

export const packageTags = pgTable(
	"package_tags",
	{
		id: uuid().primaryKey(),
		packageId: uuid()
			.notNull()
			.references(() => packages.id),
		tagId: uuid()
			.notNull()
			.references(() => tags.id),
		createdAt: timestamp().notNull(),
	},
	(table) => [
		unique().on(table.packageId, table.tagId),
		index("idx_package_tags_tag_id").on(table.tagId),
	],
);

export const packageUpvotes = pgTable(
	"package_upvotes",
	{
		id: uuid().primaryKey(),
		packageId: uuid()
			.notNull()
			.references(() => packages.id),
		accountId: uuid()
			.notNull()
			.references(() => account.id),
		createdAt: timestamp().notNull(),
	},
	(table) => [
		unique().on(table.packageId, table.accountId),
		index("idx_package_upvotes_account_id").on(table.accountId),
	],
);

import { relations, sql } from "drizzle-orm";
import {
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

// ============================================================================
// Enums
// ============================================================================

export const registryEnum = pgEnum("registry", ["npm"]);

export const dependencyTypeEnum = pgEnum("dependency_type", [
	"runtime",
	"dev",
	"peer",
	"optional",
]);

export const packageRequestStatusEnum = pgEnum("package_request_status", [
	"pending",
	"fetching",
	"completed",
	"failed",
	"discarded",
]);

export const auditActionEnum = pgEnum("audit_action", [
	"create",
	"insert",
	"update",
	"upsert",
	"delete",
]);

export const actorTypeEnum = pgEnum("actor_type", ["user", "worker", "system"]);

export const packageStatusEnum = pgEnum("package_status", [
	"active",
	"failed",
	"placeholder",
]);

// ============================================================================
// Users
// ============================================================================

export const account = pgTable("account", {
	id: uuid().primaryKey(),
	email: varchar({ length: 100 }).unique(),
	name: varchar({ length: 50 }).unique(),
	createdAt: timestamp().notNull(),
	updatedAt: timestamp().notNull(),
});

// ============================================================================
// TechGarden Schema - Package Registry
// ============================================================================

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

export const packageRequests = pgTable(
	"package_requests",
	{
		id: uuid().primaryKey(),
		packageName: text().notNull(),
		registry: registryEnum().notNull(),
		status: packageRequestStatusEnum().notNull(),
		errorMessage: text(),
		packageId: uuid().references(() => packages.id),
		attemptCount: integer().notNull(),
		createdAt: timestamp().notNull(),
		updatedAt: timestamp().notNull(),
	},
	(table) => [
		index("idx_package_requests_unique_pending")
			.on(table.packageName, table.registry, table.status)
			.where(sql`${table.status} IN ('pending', 'fetching')`),
		index("idx_package_requests_status_created")
			.on(table.status, table.createdAt)
			.where(sql`${table.status} IN ('pending', 'fetching')`),
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

export const auditLog = pgTable("audit_log", {
	id: uuid().primaryKey(),
	entityType: text().notNull(),
	entityId: uuid(),
	action: auditActionEnum().notNull(),
	actorType: actorTypeEnum().notNull(),
	actorId: uuid().references(() => account.id),
	metadata: jsonb(),
	createdAt: timestamp().notNull(),
});

// ============================================================================
// Relations
// ============================================================================

export const packagesRelations = relations(packages, ({ many }) => ({
	releaseChannels: many(packageReleaseChannels),
	channelDependents: many(channelDependencies, {
		relationName: "dependencyPackage",
	}),
	packageTags: many(packageTags),
	requests: many(packageRequests),
	upvotes: many(packageUpvotes),
}));

export const packageRequestsRelations = relations(
	packageRequests,
	({ one }) => ({
		package: one(packages, {
			fields: [packageRequests.packageId],
			references: [packages.id],
		}),
	}),
);

export const tagsRelations = relations(tags, ({ many }) => ({
	packageTags: many(packageTags),
}));

export const packageTagsRelations = relations(packageTags, ({ one }) => ({
	package: one(packages, {
		fields: [packageTags.packageId],
		references: [packages.id],
	}),
	tag: one(tags, {
		fields: [packageTags.tagId],
		references: [tags.id],
	}),
}));

export const packageUpvotesRelations = relations(packageUpvotes, ({ one }) => ({
	package: one(packages, {
		fields: [packageUpvotes.packageId],
		references: [packages.id],
	}),
	account: one(account, {
		fields: [packageUpvotes.accountId],
		references: [account.id],
	}),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
	actor: one(account, {
		fields: [auditLog.actorId],
		references: [account.id],
	}),
}));

export const packageReleaseChannelsRelations = relations(
	packageReleaseChannels,
	({ one, many }) => ({
		package: one(packages, {
			fields: [packageReleaseChannels.packageId],
			references: [packages.id],
		}),
		dependencies: many(channelDependencies),
	}),
);

export const channelDependenciesRelations = relations(
	channelDependencies,
	({ one }) => ({
		channel: one(packageReleaseChannels, {
			fields: [channelDependencies.channelId],
			references: [packageReleaseChannels.id],
		}),
		dependencyPackage: one(packages, {
			fields: [channelDependencies.dependencyPackageId],
			references: [packages.id],
			relationName: "dependencyPackage",
		}),
	}),
);

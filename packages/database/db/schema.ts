import { relations, sql } from "drizzle-orm";
import {
	boolean,
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

export const registryEnum = pgEnum("registry", ["npm", "jsr", "brew", "apt"]);

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
		description: text(),
		homepage: text(),
		repository: text(),
		latestVersion: text(),
		distTags: jsonb().$type<Record<string, string>>(),
		lastFetchAttempt: timestamp().notNull(),
		lastFetchSuccess: timestamp().notNull(),
		createdAt: timestamp().notNull(),
		updatedAt: timestamp().notNull(),
	},
	(table) => [
		unique().on(table.name, table.registry),
		index("idx_packages_name").on(table.name),
		index("idx_packages_registry").on(table.registry),
		index("idx_packages_last_fetch_attempt").on(table.lastFetchAttempt),
		index("idx_packages_created_at").on(table.createdAt),
	],
);

export const packageVersions = pgTable(
	"package_versions",
	{
		id: uuid().primaryKey(),
		packageId: uuid()
			.notNull()
			.references(() => packages.id),
		version: text().notNull(),
		publishedAt: timestamp().notNull(),
		isPrerelease: boolean().notNull(),
		isYanked: boolean().notNull(),
		createdAt: timestamp().notNull(),
	},
	(table) => [
		unique().on(table.packageId, table.version),
		index("idx_package_versions_package_id").on(table.packageId),
		index("idx_package_versions_published_at").on(table.publishedAt),
		index("idx_package_versions_stable")
			.on(table.packageId, table.publishedAt)
			.where(sql`${table.isPrerelease} = false AND ${table.isYanked} = false`),
	],
);

export const packageDependencies = pgTable(
	"package_dependencies",
	{
		id: uuid().primaryKey(),
		packageId: uuid()
			.notNull()
			.references(() => packages.id),
		versionId: uuid()
			.notNull()
			.references(() => packageVersions.id),
		dependencyName: text().notNull(),
		dependencyPackageId: uuid().references(() => packages.id),
		dependencyVersionRange: text().notNull(),
		dependencyType: dependencyTypeEnum().notNull(),
		createdAt: timestamp().notNull(),
		updatedAt: timestamp().notNull(),
	},
	(table) => [
		index("idx_package_dependencies_package_id").on(table.packageId),
		index("idx_package_dependencies_version_id").on(table.versionId),
		index("idx_package_dependencies_dependency_name").on(table.dependencyName),
		index("idx_package_dependencies_dependency_package_id").on(
			table.dependencyPackageId,
		),
		index("idx_package_dependencies_unlinked")
			.on(table.dependencyName, table.createdAt)
			.where(sql`${table.dependencyPackageId} IS NULL`),
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
	color: text(),
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
		index("idx_package_tags_package_id").on(table.packageId),
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
		index("idx_package_upvotes_package_id").on(table.packageId),
		index("idx_package_upvotes_account_id").on(table.accountId),
	],
);

export const auditLog = pgTable(
	"audit_log",
	{
		id: uuid().primaryKey(),
		entityType: text().notNull(),
		entityId: uuid(),
		action: auditActionEnum().notNull(),
		actorType: actorTypeEnum().notNull(),
		actorId: uuid().references(() => account.id),
		metadata: jsonb(),
		createdAt: timestamp().notNull(),
	},
	(table) => [
		index("idx_audit_log_entity").on(table.entityType, table.entityId),
		index("idx_audit_log_action").on(table.action),
		index("idx_audit_log_actor").on(table.actorType, table.actorId),
		index("idx_audit_log_created_at").on(table.createdAt),
	],
);

// ============================================================================
// Relations
// ============================================================================

export const packagesRelations = relations(packages, ({ many }) => ({
	versions: many(packageVersions),
	dependencies: many(packageDependencies),
	dependents: many(packageDependencies, {
		relationName: "dependencyPackage",
	}),
	packageTags: many(packageTags),
	requests: many(packageRequests),
	upvotes: many(packageUpvotes),
}));

export const packageVersionsRelations = relations(
	packageVersions,
	({ one, many }) => ({
		package: one(packages, {
			fields: [packageVersions.packageId],
			references: [packages.id],
		}),
		dependencies: many(packageDependencies),
	}),
);

export const packageDependenciesRelations = relations(
	packageDependencies,
	({ one }) => ({
		package: one(packages, {
			fields: [packageDependencies.packageId],
			references: [packages.id],
		}),
		version: one(packageVersions, {
			fields: [packageDependencies.versionId],
			references: [packageVersions.id],
		}),
		dependencyPackage: one(packages, {
			fields: [packageDependencies.dependencyPackageId],
			references: [packages.id],
			relationName: "dependencyPackage",
		}),
	}),
);

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

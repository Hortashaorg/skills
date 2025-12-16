import { relations, sql } from "drizzle-orm";
import {
	type AnyPgColumn,
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

// ============================================================================
// Existing Tables (keep for compatibility)
// ============================================================================

export const account = pgTable("account", {
	id: uuid().primaryKey(),
	email: varchar({ length: 100 }).notNull().unique(),
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
		registry: text().notNull(), // 'npm' | 'jsr' | 'brew' | 'apt'
		description: text(),
		homepage: text(),
		repository: text(),
		lastFetchAttempt: timestamp(),
		lastFetchSuccess: timestamp(),
		deletedAt: timestamp(),
		deletedBy: uuid().references(() => account.id),
		createdAt: timestamp().notNull(),
		updatedAt: timestamp().notNull(),
	},
	(table) => [
		unique().on(table.name, table.registry),
		index("idx_packages_name").on(table.name),
		index("idx_packages_registry").on(table.registry),
		index("idx_packages_last_fetch_attempt").on(table.lastFetchAttempt),
		index("idx_packages_created_at").on(table.createdAt),
		index("idx_packages_deleted_at")
			.on(table.deletedAt)
			.where(sql`${table.deletedAt} IS NULL`),
	],
);

export const packageVersions = pgTable(
	"package_versions",
	{
		id: uuid().primaryKey(),
		packageId: uuid()
			.notNull()
			.references(() => packages.id, { onDelete: "cascade" }),
		version: text().notNull(),
		publishedAt: timestamp(),
		createdAt: timestamp().notNull(),
	},
	(table) => [
		unique().on(table.packageId, table.version),
		index("idx_package_versions_package_id").on(table.packageId),
		index("idx_package_versions_published_at").on(table.publishedAt),
	],
);

export const packageDependencies = pgTable(
	"package_dependencies",
	{
		id: uuid().primaryKey(),
		packageId: uuid()
			.notNull()
			.references(() => packages.id, { onDelete: "cascade" }),
		versionId: uuid()
			.notNull()
			.references(() => packageVersions.id, { onDelete: "cascade" }),
		dependencyName: text().notNull(),
		dependencyPackageId: uuid().references(() => packages.id, {
			onDelete: "set null",
		}),
		dependencyVersionRange: text().notNull(),
		resolvedVersion: text().notNull(), // REQUIRED
		resolvedVersionId: uuid().references(() => packageVersions.id, {
			onDelete: "set null",
		}),
		dependencyType: text().notNull(), // 'runtime' | 'dev' | 'peer' | 'optional'
		createdAt: timestamp().notNull(),
	},
	(table) => [
		index("idx_package_dependencies_package_id").on(table.packageId),
		index("idx_package_dependencies_version_id").on(table.versionId),
		index("idx_package_dependencies_dependency_package_id").on(
			table.dependencyPackageId,
		),
		index("idx_package_dependencies_resolved_version_id").on(
			table.resolvedVersionId,
		),
		index("idx_package_dependencies_dependency_name").on(table.dependencyName),
		index("idx_package_dependencies_name_type").on(
			table.dependencyName,
			table.dependencyType,
		),
		index("idx_package_dependencies_name_resolved")
			.on(table.dependencyName, table.resolvedVersion)
			.where(sql`${table.resolvedVersion} IS NOT NULL`),
	],
);

export const packageRequests = pgTable(
	"package_requests",
	{
		id: uuid().primaryKey(),
		packageName: text().notNull(),
		registry: text().notNull(), // 'npm' | 'jsr' | 'brew' | 'apt'
		requestedBy: uuid().references(() => account.id, { onDelete: "set null" }),
		sourceRequestId: uuid().references((): AnyPgColumn => packageRequests.id, {
			onDelete: "set null",
		}),
		isAutoQueued: boolean().notNull(),
		status: text().notNull(), // 'pending' | 'fetching' | 'completed' | 'failed'
		errorMessage: text(),
		packageId: uuid().references(() => packages.id, { onDelete: "set null" }),
		attemptCount: integer().notNull(),
		createdAt: timestamp().notNull(),
		updatedAt: timestamp().notNull(),
	},
	(table) => [
		index("idx_package_requests_unique_pending")
			.on(table.packageName, table.registry, table.status)
			.where(sql`${table.status} IN ('pending', 'fetching')`),
		index("idx_package_requests_requested_by_created").on(
			table.requestedBy,
			table.createdAt,
		),
		index("idx_package_requests_status_created")
			.on(table.status, table.createdAt)
			.where(sql`${table.status} IN ('pending', 'fetching')`),
		index("idx_package_requests_is_auto_queued").on(
			table.isAutoQueued,
			table.status,
		),
		index("idx_package_requests_source_request_id").on(table.sourceRequestId),
	],
);

export const tags = pgTable(
	"tags",
	{
		id: uuid().primaryKey(),
		name: text().notNull().unique(),
		slug: text().notNull().unique(),
		description: text(),
		color: text(),
		deletedAt: timestamp(),
		deletedBy: uuid().references(() => account.id),
		createdAt: timestamp().notNull(),
		updatedAt: timestamp().notNull(),
	},
	(table) => [
		index("idx_tags_slug").on(table.slug),
		index("idx_tags_name").on(table.name),
		index("idx_tags_deleted_at")
			.on(table.deletedAt)
			.where(sql`${table.deletedAt} IS NULL`),
	],
);

export const packageTags = pgTable(
	"package_tags",
	{
		id: uuid().primaryKey(),
		packageId: uuid()
			.notNull()
			.references(() => packages.id, { onDelete: "cascade" }),
		tagId: uuid()
			.notNull()
			.references(() => tags.id, { onDelete: "cascade" }),
		createdBy: uuid()
			.notNull()
			.references(() => account.id, { onDelete: "cascade" }),
		createdAt: timestamp().notNull(),
	},
	(table) => [
		unique().on(table.packageId, table.tagId),
		index("idx_package_tags_package_id").on(table.packageId),
		index("idx_package_tags_tag_id").on(table.tagId),
		index("idx_package_tags_created_by").on(table.createdBy),
	],
);

// ============================================================================
// Relations
// ============================================================================

export const packagesRelations = relations(packages, ({ many, one }) => ({
	versions: many(packageVersions),
	dependencies: many(packageDependencies),
	dependents: many(packageDependencies, {
		relationName: "dependencyPackage",
	}),
	packageTags: many(packageTags),
	requests: many(packageRequests),
	deletedByUser: one(account, {
		fields: [packages.deletedBy],
		references: [account.id],
	}),
}));

export const packageVersionsRelations = relations(
	packageVersions,
	({ one, many }) => ({
		package: one(packages, {
			fields: [packageVersions.packageId],
			references: [packages.id],
		}),
		dependencies: many(packageDependencies),
		resolvedDependents: many(packageDependencies, {
			relationName: "resolvedVersion",
		}),
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
		resolvedVersion: one(packageVersions, {
			fields: [packageDependencies.resolvedVersionId],
			references: [packageVersions.id],
			relationName: "resolvedVersion",
		}),
	}),
);

export const packageRequestsRelations = relations(
	packageRequests,
	({ one }) => ({
		requestedByUser: one(account, {
			fields: [packageRequests.requestedBy],
			references: [account.id],
		}),
		sourceRequest: one(packageRequests, {
			fields: [packageRequests.sourceRequestId],
			references: [packageRequests.id],
		}),
		package: one(packages, {
			fields: [packageRequests.packageId],
			references: [packages.id],
		}),
	}),
);

export const tagsRelations = relations(tags, ({ many, one }) => ({
	packageTags: many(packageTags),
	deletedByUser: one(account, {
		fields: [tags.deletedBy],
		references: [account.id],
	}),
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
	createdByUser: one(account, {
		fields: [packageTags.createdBy],
		references: [account.id],
	}),
}));

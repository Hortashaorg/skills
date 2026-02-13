import {
	type AnyPgColumn,
	index,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { account } from "./account.ts";
import { ecosystems, projectEcosystems } from "./ecosystems.ts";
import { packages } from "./packages.ts";
import { projectPackages, projects } from "./projects.ts";

export const threads = pgTable(
	"threads",
	{
		id: uuid().primaryKey(),
		packageId: uuid().references(() => packages.id),
		ecosystemId: uuid().references(() => ecosystems.id),
		projectId: uuid().references(() => projects.id),
		projectPackageId: uuid().references(() => projectPackages.id),
		projectEcosystemId: uuid().references(() => projectEcosystems.id),
		createdAt: timestamp().notNull(),
	},
	(table) => [
		index("idx_threads_package_id").on(table.packageId),
		index("idx_threads_ecosystem_id").on(table.ecosystemId),
		index("idx_threads_project_id").on(table.projectId),
		index("idx_threads_project_package_id").on(table.projectPackageId),
		index("idx_threads_project_ecosystem_id").on(table.projectEcosystemId),
	],
);

export const comments = pgTable(
	"comments",
	{
		id: uuid().primaryKey(),
		threadId: uuid()
			.notNull()
			.references(() => threads.id),
		authorId: uuid()
			.notNull()
			.references(() => account.id),
		content: text().notNull(),
		replyToId: uuid().references((): AnyPgColumn => comments.id),
		rootCommentId: uuid().references((): AnyPgColumn => comments.id),
		createdAt: timestamp().notNull(),
		updatedAt: timestamp().notNull(),
		deletedAt: timestamp(),
	},
	(table) => [
		index("idx_comments_thread_id").on(table.threadId),
		index("idx_comments_author_id").on(table.authorId),
		index("idx_comments_reply_to_id").on(table.replyToId),
		index("idx_comments_root_comment_id").on(table.rootCommentId),
	],
);

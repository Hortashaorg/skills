import {
	index,
	integer,
	jsonb,
	pgTable,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";
import { account } from "./account.ts";
import {
	contributionEventTypeEnum,
	suggestionStatusEnum,
	suggestionTypeEnum,
	voteEnum,
} from "./enums.ts";
import { packages } from "./packages.ts";

export const suggestions = pgTable(
	"suggestions",
	{
		id: uuid().primaryKey(),
		packageId: uuid()
			.notNull()
			.references(() => packages.id),
		accountId: uuid()
			.notNull()
			.references(() => account.id),
		type: suggestionTypeEnum().notNull(),
		version: integer().notNull(),
		payload: jsonb().notNull(),
		status: suggestionStatusEnum().notNull(),
		createdAt: timestamp().notNull(),
		updatedAt: timestamp().notNull(),
		resolvedAt: timestamp(),
	},
	(table) => [
		index("idx_suggestions_package_id").on(table.packageId),
		index("idx_suggestions_status").on(table.status),
		index("idx_suggestions_account_id").on(table.accountId),
	],
);

export const suggestionVotes = pgTable(
	"suggestion_votes",
	{
		id: uuid().primaryKey(),
		suggestionId: uuid()
			.notNull()
			.references(() => suggestions.id),
		accountId: uuid()
			.notNull()
			.references(() => account.id),
		vote: voteEnum().notNull(),
		createdAt: timestamp().notNull(),
	},
	(table) => [
		unique().on(table.suggestionId, table.accountId),
		index("idx_suggestion_votes_suggestion_id").on(table.suggestionId),
	],
);

export const contributionScores = pgTable(
	"contribution_scores",
	{
		id: uuid().primaryKey(),
		accountId: uuid()
			.notNull()
			.unique()
			.references(() => account.id),
		monthlyScore: integer().notNull(),
		allTimeScore: integer().notNull(),
		lastCalculatedAt: timestamp().notNull(),
	},
	(table) => [
		index("idx_contribution_scores_monthly").on(table.monthlyScore),
		index("idx_contribution_scores_all_time").on(table.allTimeScore),
	],
);

export const contributionEvents = pgTable(
	"contribution_events",
	{
		id: uuid().primaryKey(),
		accountId: uuid()
			.notNull()
			.references(() => account.id),
		type: contributionEventTypeEnum().notNull(),
		points: integer().notNull(),
		suggestionId: uuid().references(() => suggestions.id),
		createdAt: timestamp().notNull(),
	},
	(table) => [
		index("idx_contribution_events_account_id").on(table.accountId),
		index("idx_contribution_events_created_at").on(table.createdAt),
	],
);

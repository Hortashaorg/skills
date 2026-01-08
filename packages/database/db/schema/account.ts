import { isNull } from "drizzle-orm";
import {
	pgTable,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const account = pgTable(
	"account",
	{
		id: uuid().primaryKey(),
		name: varchar({ length: 50 }).unique(),
		zitadelId: varchar({ length: 30 }).notNull(),
		createdAt: timestamp().notNull(),
		updatedAt: timestamp().notNull(),
		deletedAt: timestamp(),
	},
	(table) => [
		uniqueIndex("idx_account_zitadel_id_active")
			.on(table.zitadelId)
			.where(isNull(table.deletedAt)),
	],
);

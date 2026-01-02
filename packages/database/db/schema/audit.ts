import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { account } from "./account.ts";
import { actorTypeEnum, auditActionEnum } from "./enums.ts";

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

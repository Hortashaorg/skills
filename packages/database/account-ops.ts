/**
 * Account operations shared between backend and webhook services.
 */

import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./db/schema.ts";

type DbConnection = PostgresJsDatabase<typeof schema>;

export type SoftDeleteResult = {
	success: boolean;
	accountId?: string;
	notFound?: boolean;
};

/**
 * Soft delete an account by ID.
 * - Sets deletedAt timestamp
 * - Clears name (anonymization for GDPR)
 * - Updates updatedAt
 */
export async function softDeleteAccountById(
	db: DbConnection,
	accountId: string,
): Promise<SoftDeleteResult> {
	const now = new Date();

	const result = await db
		.update(schema.account)
		.set({
			name: null,
			deletedAt: now,
			updatedAt: now,
		})
		.where(eq(schema.account.id, accountId))
		.returning({ id: schema.account.id });

	const account = result[0];
	if (!account) {
		return { success: false, notFound: true };
	}

	return { success: true, accountId: account.id };
}

/**
 * Soft delete an account by Zitadel ID.
 * Used by webhook when ZITADEL sends user.removed event.
 */
export async function softDeleteAccountByZitadelId(
	db: DbConnection,
	zitadelId: string,
): Promise<SoftDeleteResult> {
	const now = new Date();

	const result = await db
		.update(schema.account)
		.set({
			name: null,
			deletedAt: now,
			updatedAt: now,
		})
		.where(eq(schema.account.zitadelId, zitadelId))
		.returning({ id: schema.account.id });

	const account = result[0];
	if (!account) {
		return { success: false, notFound: true };
	}

	return { success: true, accountId: account.id };
}

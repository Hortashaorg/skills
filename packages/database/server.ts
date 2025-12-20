import { zeroPostgresJS } from "@rocicorp/zero/server/adapters/postgresjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dbSchema from "./db/schema.ts";
import { environment } from "./environment.ts";
import { schema } from "./zero-schema.gen.ts";

export type { Row } from "@rocicorp/zero";
export { mustGetMutator, mustGetQuery } from "@rocicorp/zero";
export { handleMutateRequest, handleQueryRequest } from "@rocicorp/zero/server";
export { mutators } from "./mutators/index.ts";
export { queries } from "./queries/index.ts";
export { schema, zql } from "./zero-schema.gen.ts";

// Re-export drizzle-orm utilities for workers
export { eq, and, or, inArray, isNull, isNotNull, sql as sqlExpr } from "drizzle-orm";

// Raw postgres client
const sqlClient = postgres(environment.ZERO_UPSTREAM_DB);

// Drizzle ORM for type-safe bulk operations
export const db = drizzle(sqlClient, { schema: dbSchema, casing: "snake_case" });

// Export schema tables for bulk operations
export { dbSchema };

export const dbProvider = zeroPostgresJS(schema, sqlClient);

// Re-export inferred types from schema
export type {
	ActorType,
	AuditAction,
	DependencyType,
	PackageRequestStatus,
	Registry,
} from "./db/types.ts";
export { enums } from "./db/types.ts";

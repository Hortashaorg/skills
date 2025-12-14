import {
	PostgresJSConnection,
	schema,
	ZQLDatabase,
} from "@package/database/server";
import postgres from "postgres";
import { environment } from "./environment.ts";

// Raw Postgres connection for server-side operations
export const sql = postgres(environment.ZERO_UPSTREAM_DB);

// ZQLDatabase for Zero transaction processing
export const db = new ZQLDatabase(new PostgresJSConnection(sql), schema);

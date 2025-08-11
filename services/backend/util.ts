import {
	PostgresJSConnection,
	schema,
	ZQLDatabase,
} from "@package/database/server";
import postgres from "postgres";
import { environment } from "./environment.ts";

export const db = new ZQLDatabase(
	new PostgresJSConnection(postgres(environment.ZERO_UPSTREAM_DB)),
	schema,
);

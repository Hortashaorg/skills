import {
	createMutators,
	PostgresJSConnection,
	PushProcessor,
	schema,
	ZQLDatabase,
} from "@package/database/server";
import postgres from "postgres";
import { environment } from "./environment.ts";

const processor = new PushProcessor(
	new ZQLDatabase(
		new PostgresJSConnection(postgres(environment.ZERO_UPSTREAM_DB)),
		schema,
	),
);

export async function handlePush(request: Request) {
	return await processor.process(createMutators(), request);
}

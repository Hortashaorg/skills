import { zeroPostgresJS } from "@rocicorp/zero/server/adapters/postgresjs";
import postgres from "postgres";
import { environment } from "./environment.ts";
import { schema } from "./zero-schema.gen.ts";

export { mustGetMutator, mustGetQuery } from "@rocicorp/zero";
export { handleMutateRequest, handleQueryRequest } from "@rocicorp/zero/server";
export { mutators } from "./mutators/index.ts";
export { queries } from "./queries/index.ts";
export { schema, zql } from "./zero-schema.gen.ts";
export const dbProvider = zeroPostgresJS(
	schema,
	postgres(environment.ZERO_UPSTREAM_DB),
);

import {
	ANYONE_CAN_DO_ANYTHING,
	definePermissions,
	type Row,
} from "@rocicorp/zero";

import { type Schema, schema } from "./zero-schema.gen.ts";

export { schema, type Schema };

export type Account = Row<Schema["tables"]["account"]>;

export const permissions = definePermissions<Record<string, never>, Schema>(
	schema,
	() => {
		return {
			account: ANYONE_CAN_DO_ANYTHING,
		};
	},
);

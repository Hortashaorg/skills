import {
	definePermissions,
	type ExpressionBuilder,
	type PermissionsConfig,
	type Row,
} from "@rocicorp/zero";

import { type Schema, schema } from "./zero-schema.gen.ts";

export { schema, type Schema };

export type Account = Row<Schema["tables"]["account"]>;

type AuthData = {
	sub: string;
	email: string;
};

const isUser = (
	auth: AuthData,
	{ cmp }: ExpressionBuilder<Schema, "account">,
) => {
	return cmp("id", auth.sub);
};

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
	return {
		account: {
			row: {
				select: [isUser],
			},
		},
	} satisfies PermissionsConfig<AuthData, Schema>;
});

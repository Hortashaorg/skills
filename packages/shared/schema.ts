import {
	ANYONE_CAN_DO_ANYTHING,
	createSchema,
	definePermissions,
	number,
	type Schema,
	string,
	table,
} from "@rocicorp/zero";

const account = table("account")
	.columns({
		id: string(),
		name: string(),
		email: string(),
		created_at: number(),
		updated_at: number(),
	})
	.primaryKey("id");

export const schema = createSchema({
	tables: [account],
});

export const permissions = definePermissions<unknown, Schema>(schema, () => ({
	account: ANYONE_CAN_DO_ANYTHING,
}));

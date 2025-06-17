import { ANYONE_CAN_DO_ANYTHING, type Row, definePermissions } from "@rocicorp/zero";
import { schema, type Schema } from "./zero-schema.gen";

export { schema, type Schema };

export type Account = Row<Schema["tables"]["account"]>;

export const permissions = definePermissions<{}, Schema>(schema, () => {
  return {
    	account: ANYONE_CAN_DO_ANYTHING,
  }
});

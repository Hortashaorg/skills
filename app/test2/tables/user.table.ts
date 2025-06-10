import {
  AlgebraicType,
  BinaryReader,
  BinaryWriter,
  deepEqual,
  Identity,
  ProductTypeElement,
  TableCache,
} from "@clockworklabs/spacetimedb-sdk";
import { EventContext } from "../types.ts";

export type User = {
  identity: Identity;
  name: string | undefined;
  online: boolean;
};

function getTypeScriptAlgebraicType(): AlgebraicType {
  return AlgebraicType.createProductType([
    new ProductTypeElement("identity", AlgebraicType.createIdentityType()),
    new ProductTypeElement(
      "name",
      AlgebraicType.createOptionType(AlgebraicType.createStringType()),
    ),
    new ProductTypeElement("online", AlgebraicType.createBoolType()),
  ]);
}

function serialize(writer: BinaryWriter, value: User): void {
  getTypeScriptAlgebraicType().serialize(writer, value);
}

function deserialize(reader: BinaryReader): User {
  return getTypeScriptAlgebraicType().deserialize(reader);
}

export const user = {
  getTypeScriptAlgebraicType,
  serialize,
  deserialize,
};

export class UserTableHandle {
  tableCache: TableCache<User>;

  constructor(tableCache: TableCache<User>) {
    this.tableCache = tableCache;
  }

  count(): number {
    return this.tableCache.count();
  }

  iter(): Iterable<User> {
    return this.tableCache.iter();
  }

  identity = {
    // Find the subscribed row whose `identity` column value is equal to `col_val`,
    // if such a row is present in the client cache.
    find: (col_val: Identity): User | undefined => {
      for (const row of this.tableCache.iter()) {
        if (deepEqual(row.identity, col_val)) {
          return row as User;
        }
      }
      return undefined;
    },
  };

  onInsert = (cb: (ctx: EventContext, row: User) => void) => {
    return this.tableCache.onInsert(cb);
  };

  removeOnInsert = (cb: (ctx: EventContext, row: User) => void) => {
    return this.tableCache.removeOnInsert(cb);
  };

  onDelete = (cb: (ctx: EventContext, row: User) => void) => {
    return this.tableCache.onDelete(cb);
  };

  removeOnDelete = (cb: (ctx: EventContext, row: User) => void) => {
    return this.tableCache.removeOnDelete(cb);
  };

  // Updates are only defined for tables with primary keys.
  onUpdate = (cb: (ctx: EventContext, oldRow: User, newRow: User) => void) => {
    return this.tableCache.onUpdate(cb);
  };

  removeOnUpdate = (
    cb: (ctx: EventContext, onRow: User, newRow: User) => void,
  ) => {
    return this.tableCache.removeOnUpdate(cb);
  };
}

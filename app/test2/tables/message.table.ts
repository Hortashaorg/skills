import {
  AlgebraicType,
  BinaryReader,
  BinaryWriter,
  Identity,
  ProductTypeElement,
  TableCache,
  Timestamp,
} from "@clockworklabs/spacetimedb-sdk";
import { EventContext } from "../types.ts";

export type Message = {
  sender: Identity;
  sent: Timestamp;
  text: string;
};

function getTypeScriptAlgebraicType(): AlgebraicType {
  return AlgebraicType.createProductType([
    new ProductTypeElement("sender", AlgebraicType.createIdentityType()),
    new ProductTypeElement("sent", AlgebraicType.createTimestampType()),
    new ProductTypeElement("text", AlgebraicType.createStringType()),
  ]);
}

function serialize(writer: BinaryWriter, value: Message): void {
  getTypeScriptAlgebraicType().serialize(writer, value);
}

function deserialize(reader: BinaryReader): Message {
  return getTypeScriptAlgebraicType().deserialize(reader);
}

export const message = {
  getTypeScriptAlgebraicType,
  serialize,
  deserialize,
};

export class MessageTableHandle {
  tableCache: TableCache<Message>;

  constructor(tableCache: TableCache<Message>) {
    this.tableCache = tableCache;
  }

  count(): number {
    return this.tableCache.count();
  }

  iter(): Iterable<Message> {
    return this.tableCache.iter();
  }

  onInsert = (cb: (ctx: EventContext, row: Message) => void) => {
    return this.tableCache.onInsert(cb);
  };

  removeOnInsert = (cb: (ctx: EventContext, row: Message) => void) => {
    return this.tableCache.removeOnInsert(cb);
  };

  onDelete = (cb: (ctx: EventContext, row: Message) => void) => {
    return this.tableCache.onDelete(cb);
  };

  removeOnDelete = (cb: (ctx: EventContext, row: Message) => void) => {
    return this.tableCache.removeOnDelete(cb);
  };
}

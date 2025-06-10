import {
  AlgebraicType,
  BinaryReader,
  BinaryWriter,
} from "@clockworklabs/spacetimedb-sdk";

export type ClientConnected = Record<PropertyKey, never>;

function getTypeScriptAlgebraicType(): AlgebraicType {
  return AlgebraicType.createProductType([]);
}

function serialize(writer: BinaryWriter, value: ClientConnected): void {
  getTypeScriptAlgebraicType().serialize(writer, value);
}

function deserialize(reader: BinaryReader): ClientConnected {
  return getTypeScriptAlgebraicType().deserialize(reader);
}

export const clientConnected = {
  getTypeScriptAlgebraicType,
  serialize,
  deserialize,
};

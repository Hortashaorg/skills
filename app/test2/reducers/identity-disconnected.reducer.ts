import {
  AlgebraicType,
  BinaryReader,
  BinaryWriter,
} from "@clockworklabs/spacetimedb-sdk";

export type IdentityDisconnected = Record<PropertyKey, never>;

function getTypeScriptAlgebraicType(): AlgebraicType {
  return AlgebraicType.createProductType([]);
}

function serialize(
  writer: BinaryWriter,
  value: IdentityDisconnected,
): void {
  getTypeScriptAlgebraicType().serialize(writer, value);
}

function deserialize(reader: BinaryReader): IdentityDisconnected {
  return getTypeScriptAlgebraicType().deserialize(reader);
}

export const identityDisconnected = {
  getTypeScriptAlgebraicType,
  serialize,
  deserialize,
};
